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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final WalletService walletService;
    private final NotificationService notificationService;

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

        BigDecimal amount = service.getPricePerUnit()
                .multiply(BigDecimal.valueOf(request.getQuantity()));

        Booking booking = Booking.builder()
                .customer(customer)
                .vendor(service.getVendor())
                .service(service)
                .status(BookingStatus.PENDING)
                .scheduledAt(request.getScheduledAt())
                .amount(amount)
                .quantity(request.getQuantity())
                .location(request.getLocation())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .notes(request.getNotes())
                .build();

        booking = bookingRepository.save(booking);

        // Debit customer wallet
        walletService.debitForBooking(customer, amount, booking.getId(), service.getVendor().getName());

        // Notify vendor of new booking
        notificationService.createNotification(
                service.getVendor().getId(),
                NotificationType.BOOKING_CREATED,
                "New Booking Request",
                customer.getName() + " booked \"" + service.getTitle() + "\" — ₹" + amount,
                booking.getId());

        return toDTO(booking);
    }

    public List<BookingDTO> getBookingsForUser(User user) {
        List<Booking> bookings;
        switch (user.getRole()) {
            case CUSTOMER -> bookings = bookingRepository.findByCustomerIdOrderByCreatedAtDesc(user.getId());
            case VENDOR -> bookings = bookingRepository.findByVendorIdOrderByCreatedAtDesc(user.getId());
            case ADMIN -> bookings = bookingRepository.findAll();
            default -> throw new RuntimeException("Invalid role");
        }
        return bookings.stream().map(this::toDTO).collect(Collectors.toList());
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

        return toDTO(booking);
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

        booking.setStatus(targetStatus);

        if (targetStatus == BookingStatus.CONFIRMED) {
            notificationService.createNotification(
                    booking.getCustomer().getId(),
                    NotificationType.BOOKING_CONFIRMED,
                    "Booking Confirmed",
                    booking.getVendor().getName() + " confirmed your booking for \"" + booking.getService().getTitle() + "\"",
                    booking.getId());
        }

        if (targetStatus == BookingStatus.IN_PROGRESS) {
            notificationService.createNotification(
                    booking.getCustomer().getId(),
                    NotificationType.BOOKING_IN_PROGRESS,
                    "Service Started",
                    booking.getVendor().getName() + " has started your service \"" + booking.getService().getTitle() + "\"",
                    booking.getId());
        }

        if (targetStatus == BookingStatus.COMPLETED) {
            booking.setCompletedAt(LocalDateTime.now());
            walletService.creditForBooking(
                    booking.getVendor(), booking.getAmount(),
                    booking.getId(), booking.getCustomer().getName());
            notificationService.createNotification(
                    booking.getCustomer().getId(),
                    NotificationType.BOOKING_COMPLETED,
                    "Booking Completed",
                    "Your booking for \"" + booking.getService().getTitle() + "\" has been completed!",
                    booking.getId());
            notificationService.createNotification(
                    booking.getVendor().getId(),
                    NotificationType.WALLET_PAYOUT,
                    "Payment Received",
                    "₹" + booking.getAmount() + " payout for \"" + booking.getService().getTitle() + "\"",
                    booking.getId());
        }

        if (targetStatus == BookingStatus.CANCELLED) {
            walletService.refundForBooking(
                    booking.getCustomer(), booking.getAmount(),
                    booking.getId(), booking.getVendor().getName());
            notificationService.createNotification(
                    booking.getCustomer().getId(),
                    NotificationType.BOOKING_CANCELLED,
                    "Booking Cancelled",
                    "Your booking for \"" + booking.getService().getTitle() + "\" was cancelled. ₹" + booking.getAmount() + " refunded.",
                    booking.getId());
            notificationService.createNotification(
                    booking.getVendor().getId(),
                    NotificationType.BOOKING_CANCELLED,
                    "Booking Cancelled",
                    booking.getCustomer().getName() + " cancelled their booking for \"" + booking.getService().getTitle() + "\"",
                    booking.getId());
        }

        booking = bookingRepository.save(booking);
        return toDTO(booking);
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

    private BookingDTO toDTO(Booking b) {
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
