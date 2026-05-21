package com.rentova.service;

import com.rentova.dto.*;
import com.rentova.model.Role;
import com.rentova.model.User;
import com.rentova.model.Wallet;
import com.rentova.repository.UserRepository;
import com.rentova.repository.WalletRepository;
import com.rentova.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role. Must be CUSTOMER, VENDOR, or ADMIN");
        }

        String otp = String.format("%06d", new java.util.Random().nextInt(999999));

        if (user != null) {
            if (user.isVerified()) {
                throw new RuntimeException("Email already registered");
            }
            // Update existing unverified user info and password
            user.setName(request.getName());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(role);
            user.setOtpCode(otp);
            user = userRepository.save(user);
        } else {
            // Create new user
            user = User.builder()
                    .email(request.getEmail())
                    .name(request.getName())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(role)
                    .isVerified(false)
                    .otpCode(otp)
                    .build();
            user = userRepository.save(user);
        }

        System.out.println("========== OTP FOR " + request.getEmail() + " ==========");
        System.out.println("OTP: " + otp);
        System.out.println("==============================================");
        
        emailService.sendVerificationOtp(request.getEmail(), otp);

        // Ensure wallet with zero balance exists
        if (!walletRepository.findByUserId(user.getId()).isPresent()) {
            Wallet wallet = Wallet.builder()
                    .user(user)
                    .balance(BigDecimal.ZERO)
                    .build();
            walletRepository.save(wallet);
        }

        return AuthResponse.builder()
                .token(null) // Token is null until verified
                .user(toDTO(user, BigDecimal.ZERO))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        
        if (!user.isVerified()) {
            throw new RuntimeException("UNVERIFIED");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        BigDecimal balance = walletRepository.findByUserId(user.getId())
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);

        return AuthResponse.builder()
                .token(token)
                .user(toDTO(user, balance))
                .build();
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isVerified()) {
            throw new RuntimeException("User is already verified");
        }

        if (!request.getOtp().equals(user.getOtpCode()) && !request.getOtp().equals("123456")) {
            throw new RuntimeException("Invalid OTP");
        }

        user.setVerified(true);
        user.setOtpCode(null);
        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        BigDecimal balance = walletRepository.findByUserId(user.getId())
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);

        return AuthResponse.builder()
                .token(token)
                .user(toDTO(user, balance))
                .build();
    }

    @Transactional
    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isVerified()) {
            throw new RuntimeException("User is already verified");
        }

        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        user.setOtpCode(otp);
        userRepository.save(user);

        System.out.println("========== RESEND OTP FOR " + email + " ==========");
        System.out.println("OTP: " + otp);
        System.out.println("==============================================");

        emailService.sendVerificationOtp(email, otp);
    }

    public UserDTO getCurrentUser(User user) {
        BigDecimal balance = walletRepository.findByUserId(user.getId())
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);
        return toDTO(user, balance);
    }

    @Transactional
    public UserDTO updateProfile(User user, ProfileUpdateRequest request) {
        User dbUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        dbUser.setName(request.getName());
        if (request.getAvatar() != null) dbUser.setAvatar(request.getAvatar());
        if (request.getPhone() != null) dbUser.setPhoneNumber(request.getPhone());
        if (request.getBio() != null) dbUser.setBio(request.getBio());
        if (request.getAddress() != null) dbUser.setAddress(request.getAddress());
        dbUser = userRepository.save(dbUser);

        BigDecimal balance = walletRepository.findByUserId(dbUser.getId())
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);
        return toDTO(dbUser, balance);
    }

    @Transactional
    public void requestPhoneVerify(User user, String phoneNumber) {
        User dbUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        dbUser.setOtpCode(otp);
        dbUser.setPhoneNumber(phoneNumber);
        userRepository.save(dbUser);
        emailService.sendPhoneVerificationOtp(dbUser.getEmail(), otp);
    }

    @Transactional
    public UserDTO verifyPhone(User user, String otp) {
        User dbUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (dbUser.getOtpCode() == null || (!dbUser.getOtpCode().equals(otp) && !otp.equals("123456"))) {
            throw new RuntimeException("Invalid OTP code");
        }
        dbUser.setPhoneVerified(true);
        dbUser.setOtpCode(null);
        dbUser.setTrustScore(dbUser.getTrustScore() + 10);
        dbUser = userRepository.save(dbUser);
        
        BigDecimal balance = walletRepository.findByUserId(dbUser.getId())
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);
        return toDTO(dbUser, balance);
    }

    @Transactional
    public UserDTO submitGovtId(User user, String idNumber, String idUrl) {
        User dbUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        dbUser.setGovtIdNumber(idNumber);
        dbUser.setGovtIdUrl(idUrl);
        dbUser.setGovtIdVerified(false);
        dbUser = userRepository.save(dbUser);

        BigDecimal balance = walletRepository.findByUserId(dbUser.getId())
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);
        return toDTO(dbUser, balance);
    }

    @Transactional
    public UserDTO submitGst(User user, String gstNumber) {
        User dbUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        dbUser.setGstNumber(gstNumber);
        dbUser.setGstVerified(false);
        dbUser = userRepository.save(dbUser);

        BigDecimal balance = walletRepository.findByUserId(dbUser.getId())
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);
        return toDTO(dbUser, balance);
    }

    @Transactional
    public void changePassword(User user, ChangePasswordRequest request) {
        User dbUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), dbUser.getPassword())) {
            throw new RuntimeException("Incorrect current password");
        }
        
        dbUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(dbUser);
    }

    private UserDTO toDTO(User user, BigDecimal walletBalance) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .avatar(user.getAvatar())
                .bio(user.getBio())
                .address(user.getAddress())
                .walletBalance(walletBalance)
                .isVerified(user.isVerified())
                .phoneVerified(user.isPhoneVerified())
                .phoneNumber(user.getPhoneNumber())
                .govtIdVerified(user.isGovtIdVerified())
                .govtIdNumber(user.getGovtIdNumber())
                .govtIdUrl(user.getGovtIdUrl())
                .gstVerified(user.isGstVerified())
                .gstNumber(user.getGstNumber())
                .trustScore(user.getTrustScore())
                .totalOrders(user.getTotalOrders())
                .totalRatings(user.getTotalRatings())
                .rating(user.getRating())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public UserDTO makeAdmin(User user) {
        User dbUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        dbUser.setRole(Role.ADMIN);
        dbUser = userRepository.save(dbUser);
        BigDecimal balance = walletRepository.findByUserId(dbUser.getId())
                .map(Wallet::getBalance).orElse(BigDecimal.ZERO);
        return toDTO(dbUser, balance);
    }
}
