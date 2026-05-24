package com.rentova.config;

import com.rentova.model.Role;
import com.rentova.model.User;
import com.rentova.model.Wallet;
import com.rentova.repository.UserRepository;
import com.rentova.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Profile("!prod")
@RequiredArgsConstructor
public class DevDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUser("customer@rentova.local", "Customer Demo", Role.CUSTOMER, new BigDecimal("5000.00"), "password123");
        seedUser("vendor@rentova.local", "Vendor Demo", Role.VENDOR, BigDecimal.ZERO, "password123");
        seedUser("admin@rentova.local", "Admin Demo", Role.ADMIN, BigDecimal.ZERO, "password123");
        seedUser("admin@rentova.com", "System Administrator", Role.ADMIN, BigDecimal.ZERO, "admin123");
        seedUser("manjubhat8105+admin@gmail.com", "Manju", Role.ADMIN, BigDecimal.ZERO, "admin123");
    }

    private void seedUser(String email, String name, Role role, BigDecimal balance, String plainPassword) {
        userRepository.findByEmail(email).ifPresentOrElse(
                user -> ensureWallet(user, balance),
                () -> {
                    User user = User.builder()
                            .email(email)
                            .name(name)
                            .password(passwordEncoder.encode(plainPassword))
                            .role(role)
                            .isVerified(true)
                            .build();
                    ensureWallet(userRepository.save(user), balance);
                });
    }

    private void ensureWallet(User user, BigDecimal balance) {
        walletRepository.findByUserId(user.getId()).orElseGet(() -> walletRepository.save(
                Wallet.builder()
                        .user(user)
                        .balance(balance)
                        .build()));
    }
}
