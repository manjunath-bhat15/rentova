package com.rentova.controller;

import com.rentova.dto.*;
import com.rentova.model.User;
import com.rentova.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    public ResponseEntity<List<BookingDTO>> getBookings(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.getBookingsForUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getBooking(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(bookingService.getBookingById(id, user));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(bookingService.createBooking(request, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingDTO> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        try {
            String status = body.get("status");
            if (status == null) return ResponseEntity.badRequest().build();
            return ResponseEntity.ok(bookingService.updateBookingStatus(id, status, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<?> verifyStartOtp(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        try {
            String otp = body.get("otp");
            if (otp == null) return ResponseEntity.badRequest().body(Map.of("message", "Verification code is required"));
            return ResponseEntity.ok(bookingService.verifyStartOtp(id, otp, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<?> verifyEndOtp(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        try {
            String otp = body.get("otp");
            if (otp == null) return ResponseEntity.badRequest().body(Map.of("message", "Verification code is required"));
            return ResponseEntity.ok(bookingService.verifyEndOtp(id, otp, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
