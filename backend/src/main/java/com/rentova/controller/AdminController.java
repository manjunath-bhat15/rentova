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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.rentova.repository.ChatMessageRepository;
import com.rentova.repository.NotificationRepository;
import com.rentova.repository.TransactionRepository;

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
    private final ChatMessageRepository chatMessageRepository;
    private final NotificationRepository notificationRepository;
    private final TransactionRepository transactionRepository;
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

    @DeleteMapping("/users/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // 1. Delete all bookings where this user is customer or vendor
        List<com.rentova.model.Booking> bookings = bookingRepository.findAll().stream()
                .filter(b -> b.getCustomer().getId().equals(id) || b.getVendor().getId().equals(id))
                .toList();
        for (com.rentova.model.Booking booking : bookings) {
            List<com.rentova.model.Transaction> txs = transactionRepository.findByBookingId(booking.getId());
            transactionRepository.deleteAll(txs);
            List<com.rentova.model.ChatMessage> chats = chatMessageRepository.findByBookingIdOrderByCreatedAtAsc(booking.getId());
            chatMessageRepository.deleteAll(chats);
            bookingRepository.delete(booking);
        }
        
        // 2. Delete all services where this user is vendor
        List<com.rentova.model.ServiceEntity> services = serviceRepository.findAll().stream()
                .filter(s -> s.getVendor().getId().equals(id))
                .toList();
        for (com.rentova.model.ServiceEntity service : services) {
            List<com.rentova.model.Booking> serviceBookings = bookingRepository.findAll().stream()
                    .filter(b -> b.getService().getId().equals(service.getId()))
                    .toList();
            for (com.rentova.model.Booking sb : serviceBookings) {
                List<com.rentova.model.Transaction> txs = transactionRepository.findByBookingId(sb.getId());
                transactionRepository.deleteAll(txs);
                List<com.rentova.model.ChatMessage> chats = chatMessageRepository.findByBookingIdOrderByCreatedAtAsc(sb.getId());
                chatMessageRepository.deleteAll(chats);
                bookingRepository.delete(sb);
            }
            serviceRepository.delete(service);
        }
        
        // 3. Delete all transactions for this user's wallet
        if (user.getWallet() != null) {
            List<com.rentova.model.Transaction> walletTxs = transactionRepository.findByWalletIdOrderByCreatedAtDesc(user.getWallet().getId());
            transactionRepository.deleteAll(walletTxs);
        }
        
        // 4. Delete all chat messages where the user was sender or recipient
        List<com.rentova.model.ChatMessage> userChats = chatMessageRepository.findAll().stream()
                .filter(c -> c.getSenderId().equals(id) || c.getRecipientId().equals(id))
                .toList();
        chatMessageRepository.deleteAll(userChats);
        
        // 5. Delete all notifications for this user
        List<com.rentova.model.Notification> userNotifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(id);
        notificationRepository.deleteAll(userNotifs);
        
        // 6. Delete the user
        userRepository.delete(user);
        
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/bookings/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Void> deleteBooking(@PathVariable String id) {
        com.rentova.model.Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        List<com.rentova.model.Transaction> txs = transactionRepository.findByBookingId(id);
        transactionRepository.deleteAll(txs);
        
        List<com.rentova.model.ChatMessage> chats = chatMessageRepository.findByBookingIdOrderByCreatedAtAsc(id);
        chatMessageRepository.deleteAll(chats);
        
        bookingRepository.delete(booking);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/services/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Void> deleteService(@PathVariable String id) {
        com.rentova.model.ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        
        List<com.rentova.model.Booking> bookings = bookingRepository.findAll().stream()
                .filter(b -> b.getService().getId().equals(id))
                .toList();
        for (com.rentova.model.Booking booking : bookings) {
            List<com.rentova.model.Transaction> txs = transactionRepository.findByBookingId(booking.getId());
            transactionRepository.deleteAll(txs);
            List<com.rentova.model.ChatMessage> chats = chatMessageRepository.findByBookingIdOrderByCreatedAtAsc(booking.getId());
            chatMessageRepository.deleteAll(chats);
            bookingRepository.delete(booking);
        }
        
        serviceRepository.delete(service);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/users/{id}/wallet")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<UserDTO> adjustUserWallet(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        BigDecimal newBalance = new BigDecimal(body.get("balance").toString());
        Wallet wallet = walletRepository.findByUserId(id)
                .orElseGet(() -> {
                    Wallet w = Wallet.builder()
                            .user(user)
                            .balance(BigDecimal.ZERO)
                            .build();
                    return walletRepository.save(w);
                });
        
        BigDecimal difference = newBalance.subtract(wallet.getBalance());
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);
        
        com.rentova.model.Transaction tx = com.rentova.model.Transaction.builder()
                .wallet(wallet)
                .type(com.rentova.model.TransactionType.TRANSFER)
                .amount(difference)
                .balanceAfter(newBalance)
                .description("Manual Admin Wallet Adjustment")
                .build();
        transactionRepository.save(tx);
        
        return ResponseEntity.ok(toDTO(user));
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
