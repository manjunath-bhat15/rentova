package com.rentova.controller;

import com.rentova.dto.BookingDTO;
import com.rentova.dto.ServiceDTO;
import com.rentova.model.BookingStatus;
import com.rentova.model.User;
import com.rentova.service.BookingService;
import com.rentova.service.ServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vendor")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('VENDOR','ADMIN')")
public class VendorController {

    private final BookingService bookingService;
    private final ServiceService serviceService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(@AuthenticationPrincipal User user) {
        List<BookingDTO> bookings = bookingService.getBookingsForUser(user);
        List<ServiceDTO> services = serviceService.getServicesByVendor(user.getId());

        BigDecimal revenue = bookings.stream()
                .filter(booking -> BookingStatus.COMPLETED.name().equals(booking.getStatus()))
                .map(BookingDTO::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ResponseEntity.ok(Map.of(
                "totalServices", services.size(),
                "activeServices", services.stream().filter(ServiceDTO::isActive).count(),
                "pendingBookings", bookings.stream().filter(b -> BookingStatus.PENDING.name().equals(b.getStatus())).count(),
                "activeBookings", bookings.stream()
                        .filter(b -> !BookingStatus.COMPLETED.name().equals(b.getStatus())
                                && !BookingStatus.CANCELLED.name().equals(b.getStatus()))
                        .count(),
                "totalRevenue", revenue
        ));
    }

    @GetMapping("/services")
    public ResponseEntity<List<ServiceDTO>> getServices(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(serviceService.getServicesByVendor(user.getId()));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDTO>> getBookings(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.getBookingsForUser(user));
    }
}
