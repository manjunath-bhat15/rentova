package com.rentova.controller;

import com.rentova.dto.BookingDTO;
import com.rentova.dto.ServiceDTO;
import com.rentova.dto.UserDTO;
import com.rentova.model.BookingStatus;
import com.rentova.model.Role;
import com.rentova.model.User;
import com.rentova.model.Wallet;
import com.rentova.repository.BookingRepository;
import com.rentova.repository.ServiceRepository;
import com.rentova.repository.UserRepository;
import com.rentova.repository.WalletRepository;
import com.rentova.service.BookingService;
import com.rentova.service.ServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final BookingService bookingService;
    private final ServiceService serviceService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        BigDecimal totalRevenue = bookingRepository.findAll().stream()
                .filter(booking -> booking.getStatus() == BookingStatus.COMPLETED)
                .map(booking -> booking.getAmount() == null ? BigDecimal.ZERO : booking.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalUsers = userRepository.count();
        long totalServices = serviceRepository.count();
        long activeServices = serviceRepository.findByIsActiveTrue().size();

        Map<String, Object> stats = Map.of(
                "totalUsers", totalUsers,
                "customers", countRole(Role.CUSTOMER),
                "vendors", countRole(Role.VENDOR),
                "admins", countRole(Role.ADMIN),
                "totalBookings", bookingRepository.count(),
                "pendingBookings", bookingRepository.findByStatusOrderByCreatedAtDesc(BookingStatus.PENDING).size(),
                "completedBookings", bookingRepository.findByStatusOrderByCreatedAtDesc(BookingStatus.COMPLETED).size(),
                "totalServices", totalServices,
                "activeServices", activeServices,
                "totalRevenue", totalRevenue
        );

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getCreatedAt).reversed())
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<UserDTO> updateUserRole(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            Role role = Role.valueOf(body.getOrDefault("role", "").toUpperCase());
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setRole(role);
            return ResponseEntity.ok(toDTO(userRepository.save(user)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDTO>> getAllBookings(@AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(bookingService.getBookingsForUser(admin));
    }

    @PatchMapping("/bookings/{id}/status")
    public ResponseEntity<BookingDTO> updateBookingStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User admin) {
        try {
            String status = body.get("status");
            if (status == null) return ResponseEntity.badRequest().build();
            return ResponseEntity.ok(bookingService.updateBookingStatus(id, status, admin));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/services")
    public ResponseEntity<List<ServiceDTO>> getAllServices() {
        return ResponseEntity.ok(serviceService.getAllServicesForAdmin());
    }

    @PatchMapping("/services/{id}/toggle")
    public ResponseEntity<Void> toggleService(@PathVariable String id, @AuthenticationPrincipal User admin) {
        try {
            serviceService.toggleServiceStatus(id, admin);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private long countRole(Role role) {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == role)
                .count();
    }

    private UserDTO toDTO(User user) {
        BigDecimal walletBalance = walletRepository.findByUserId(user.getId())
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .avatar(user.getAvatar())
                .walletBalance(walletBalance)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
