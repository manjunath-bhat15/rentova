package com.rentova.controller;

import com.rentova.dto.BookingDTO;
import com.rentova.dto.ServiceDTO;
import com.rentova.dto.WalletDTO;
import com.rentova.model.BookingStatus;
import com.rentova.model.User;
import com.rentova.service.BookingService;
import com.rentova.service.ServiceService;
import com.rentova.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')")
public class CustomerController {

    private final BookingService bookingService;
    private final ServiceService serviceService;
    private final WalletService walletService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(@AuthenticationPrincipal User user) {
        List<BookingDTO> bookings = bookingService.getBookingsForUser(user);
        WalletDTO wallet = walletService.getWallet(user);

        long activeBookings = bookings.stream()
                .filter(booking -> !BookingStatus.COMPLETED.name().equals(booking.getStatus())
                        && !BookingStatus.CANCELLED.name().equals(booking.getStatus()))
                .count();

        return ResponseEntity.ok(Map.of(
                "activeBookings", activeBookings,
                "completedBookings", bookings.stream().filter(b -> BookingStatus.COMPLETED.name().equals(b.getStatus())).count(),
                "pendingBookings", bookings.stream().filter(b -> BookingStatus.PENDING.name().equals(b.getStatus())).count(),
                "walletBalance", wallet.getBalance()
        ));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDTO>> getBookings(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.getBookingsForUser(user));
    }

    @GetMapping("/services/nearby")
    public ResponseEntity<List<ServiceDTO>> getNearbyServices(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "10") double radiusKm,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(serviceService.getNearbyServices(latitude, longitude, radiusKm, search, category));
    }
}
