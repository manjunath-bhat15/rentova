package com.rentova.service;

import com.rentova.dto.*;
import com.rentova.model.*;
import com.rentova.repository.BookingRepository;
import com.rentova.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final WalletService walletService;
    private final NotificationService notificationService;

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(1000000));
    }

    @Transactional
    public BookingDTO createBooking(CreateBookingRequest request, User customer) {
        ServiceEntity service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));

        if (!service.isActive()) {
            throw new RuntimeException("This service is currently unavailable");
        }

        // Cannot book own service
        if (service.getVendor().getId().equals(customer.getId())) {
            throw new RuntimeException("You cannot book your own service");
        }

        // Validate fulfillment model
        String model = request.getFulfillmentModel().toUpperCase();
        if ("PICKUP".equals(model) && !service.isAllowPickup()) {
            throw new RuntimeException("Pickup option is not available for this listing");
        } else if ("DELIVERY".equals(model) && !service.isAllowDelivery()) {
            throw new RuntimeException("Home delivery option is not available for this listing");
        }

        BigDecimal amount = service.getPricePerUnit()
                .multiply(BigDecimal.valueOf(request.getQuantity()));

        // Snapshot current security deposit
        BigDecimal securityDeposit = service.getSecurityDeposit()
                .multiply(BigDecimal.valueOf(request.getQuantity()));

        // Generate lifecycle OTPs
        String startOtp = generateOtp();
        String endOtp = generateOtp();

        Booking booking = Booking.builder()
                .customer(customer)
                .vendor(service.getVendor())
                .service(service)
                .status(BookingStatus.PENDING)
                .scheduledAt(request.getScheduledAt())
                .amount(amount)
                .securityDeposit(securityDeposit)
                .fulfillmentModel(model)
                .startOtp(startOtp)
                .endOtp(endOtp)
                .quantity(request.getQuantity())
                .location(request.getLocation())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .notes(request.getNotes())
                .build();

        booking = bookingRepository.save(booking);

        // Do NOT debit wallet here - payment is debited only when service starts (using Start OTP)

        // Notify vendor of new booking
        notificationService.createNotification(
                service.getVendor().getId(),
                NotificationType.BOOKING_CREATED,
                "New Booking Request",
                customer.getName() + " booked \"" + service.getTitle() + "\" — Total ₹" + amount.add(securityDeposit) + " (incl. Deposit)",
                booking.getId());

        return toDTO(booking, customer);
    }

    public List<BookingDTO> getBookingsForUser(User user) {
        List<Booking> bookings;
        switch (user.getRole()) {
            case CUSTOMER -> bookings = bookingRepository.findByCustomerIdOrderByCreatedAtDesc(user.getId());
            case VENDOR -> bookings = bookingRepository.findByVendorIdOrderByCreatedAtDesc(user.getId());
            case ADMIN -> bookings = bookingRepository.findAll();
            default -> throw new RuntimeException("Invalid role");
        }
        return bookings.stream().map(b -> toDTO(b, user)).collect(Collectors.toList());
    }

    public BookingDTO getBookingById(String id, User user) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Authorization check
        if (user.getRole() != Role.ADMIN
                && !booking.getCustomer().getId().equals(user.getId())
                && !booking.getVendor().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to view this booking");
        }

        return toDTO(booking, user);
    }

    @Transactional
    public BookingDTO verifyStartOtp(String id, String otp, User vendor) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getVendor().getId().equals(vendor.getId()) && vendor.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only the vendor can verify the start code");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException("Service can only be started for CONFIRMED bookings");
        }

        if (!booking.getStartOtp().equals(otp)) {
            throw new RuntimeException("Invalid verification code. Please check and try again.");
        }

        // OTP matches! Transition to IN_PROGRESS
        booking.setStatus(BookingStatus.IN_PROGRESS);

        // Debit the customer: total = booking amount + security deposit
        BigDecimal totalDebit = booking.getAmount().add(booking.getSecurityDeposit());
        walletService.debitForBooking(booking.getCustomer(), totalDebit, booking.getId(), booking.getVendor().getName());

        // Notify customer
        notificationService.createNotification(
                booking.getCustomer().getId(),
                NotificationType.BOOKING_IN_PROGRESS,
                "Service Started",
                booking.getVendor().getName() + " verified your code. Rental started & funds debited (Deposit held).",
                booking.getId());

        booking = bookingRepository.save(booking);
        return toDTO(booking, vendor);
    }

    @Transactional
    public BookingDTO verifyEndOtp(String id, String otp, User customer) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getCustomer().getId().equals(customer.getId()) && customer.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only the customer can verify the end code");
        }

        if (booking.getStatus() != BookingStatus.IN_PROGRESS) {
            throw new RuntimeException("Service can only be ended for IN_PROGRESS bookings");
        }

        if (!booking.getEndOtp().equals(otp)) {
            throw new RuntimeException("Invalid verification code. Please check and try again.");
        }

        // OTP matches! Transition to COMPLETED
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setCompletedAt(LocalDateTime.now());

        // Payout to Vendor (Rental Charge only)
        walletService.creditForBooking(
                booking.getVendor(), booking.getAmount(),
                booking.getId(), booking.getCustomer().getName());

        // Refund Security Deposit back to Customer
        walletService.refundForBooking(
                booking.getCustomer(), booking.getSecurityDeposit(),
                booking.getId(), booking.getVendor().getName());

        // Notifications
        notificationService.createNotification(
                booking.getCustomer().getId(),
                NotificationType.BOOKING_COMPLETED,
                "Booking Completed",
                "Your booking for \"" + booking.getService().getTitle() + "\" has been completed and your security deposit refunded!",
                booking.getId());
                
        notificationService.createNotification(
                booking.getVendor().getId(),
                NotificationType.WALLET_PAYOUT,
                "Payment Received",
                "₹" + booking.getAmount() + " payout for \"" + booking.getService().getTitle() + "\"",
                booking.getId());

        booking = bookingRepository.save(booking);
        return toDTO(booking, customer);
    }

    @Transactional
    public BookingDTO updateBookingStatus(String id, String newStatus, User user) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        BookingStatus targetStatus;
        try {
            targetStatus = BookingStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status");
        }

        // Validate transition based on role
        validateStatusTransition(booking, targetStatus, user);

        // Security check: cannot transition to IN_PROGRESS or COMPLETED manually anymore
        if (targetStatus == BookingStatus.IN_PROGRESS || targetStatus == BookingStatus.COMPLETED) {
            throw new RuntimeException("This status transition requires OTP verification code.");
        }

        booking.setStatus(targetStatus);

        if (targetStatus == BookingStatus.CONFIRMED) {
            notificationService.createNotification(
                    booking.getCustomer().getId(),
                    NotificationType.BOOKING_CONFIRMED,
                    "Booking Confirmed",
                    booking.getVendor().getName() + " confirmed your booking for \"" + booking.getService().getTitle() + "\"",
                    booking.getId());
        }

        if (targetStatus == BookingStatus.CANCELLED) {
            // Only refund if they were already debited (i.e. status was IN_PROGRESS)
            if (booking.getStatus() == BookingStatus.IN_PROGRESS) {
                BigDecimal totalAmount = booking.getAmount().add(booking.getSecurityDeposit());
                walletService.refundForBooking(
                        booking.getCustomer(), totalAmount,
                        booking.getId(), booking.getVendor().getName());
            }

            notificationService.createNotification(
                    booking.getCustomer().getId(),
                    NotificationType.BOOKING_CANCELLED,
                    "Booking Cancelled",
                    "Your booking for \"" + booking.getService().getTitle() + "\" was cancelled.",
                    booking.getId());
            notificationService.createNotification(
                    booking.getVendor().getId(),
                    NotificationType.BOOKING_CANCELLED,
                    "Booking Cancelled",
                    booking.getCustomer().getName() + " cancelled their booking for \"" + booking.getService().getTitle() + "\"",
                    booking.getId());
        }

        booking = bookingRepository.save(booking);
        return toDTO(booking, user);
    }

    private void validateStatusTransition(Booking booking, BookingStatus target, User user) {
        BookingStatus current = booking.getStatus();
        boolean isVendor = booking.getVendor().getId().equals(user.getId());
        boolean isCustomer = booking.getCustomer().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;

        // CANCELLED can be done by customer (if PENDING) or admin
        if (target == BookingStatus.CANCELLED) {
            if (isAdmin) return;
            if (isCustomer && current == BookingStatus.PENDING) return;
            if (isVendor && (current == BookingStatus.PENDING || current == BookingStatus.CONFIRMED)) return;
            throw new RuntimeException("Cannot cancel booking in current state");
        }

        // Vendor/Admin can confirm, start, or complete
        if (!isVendor && !isAdmin) {
            throw new RuntimeException("Only vendor or admin can change status");
        }

        switch (target) {
            case CONFIRMED -> {
                if (current != BookingStatus.PENDING)
                    throw new RuntimeException("Can only confirm PENDING bookings");
            }
            case IN_PROGRESS -> {
                if (current != BookingStatus.CONFIRMED)
                    throw new RuntimeException("Can only start CONFIRMED bookings");
            }
            case COMPLETED -> {
                if (current != BookingStatus.IN_PROGRESS)
                    throw new RuntimeException("Can only complete IN_PROGRESS bookings");
            }
            default -> throw new RuntimeException("Invalid status transition");
        }
    }

    private BookingDTO toDTO(Booking b, User viewer) {
        String startOtp = null;
        String endOtp = null;
        if (viewer != null) {
            if (viewer.getRole() == Role.ADMIN) {
                startOtp = b.getStartOtp();
                endOtp = b.getEndOtp();
            } else if (viewer.getId().equals(b.getCustomer().getId())) {
                startOtp = b.getStartOtp();
            } else if (viewer.getId().equals(b.getVendor().getId())) {
                endOtp = b.getEndOtp();
            }
        }

        return BookingDTO.builder()
                .id(b.getId())
                .customerId(b.getCustomer().getId())
                .customerName(b.getCustomer().getName())
                .vendorId(b.getVendor().getId())
                .vendorName(b.getVendor().getName())
                .serviceId(b.getService().getId())
                .serviceTitle(b.getService().getTitle())
                .status(b.getStatus().name())
                .scheduledAt(b.getScheduledAt())
                .completedAt(b.getCompletedAt())
                .amount(b.getAmount())
                .securityDeposit(b.getSecurityDeposit())
                .fulfillmentModel(b.getFulfillmentModel())
                .startOtp(startOtp)
                .endOtp(endOtp)
                .quantity(b.getQuantity())
                .location(b.getLocation())
                .latitude(b.getLatitude())
                .longitude(b.getLongitude())
                .serviceLocation(b.getService().getLocation())
                .serviceLatitude(b.getService().getLatitude())
                .serviceLongitude(b.getService().getLongitude())
                .notes(b.getNotes())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}
