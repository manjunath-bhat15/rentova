package com.rentova.controller;

import com.rentova.dto.*;
import com.rentova.model.User;
import com.rentova.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = userService.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            AuthResponse response = userService.verifyOtp(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Void> resendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            userService.resendOtp(email);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userService.getCurrentUser(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(@AuthenticationPrincipal User user, @Valid @RequestBody ProfileUpdateRequest request) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userService.updateProfile(user, request));
    }

    @PostMapping("/request-phone-verify")
    public ResponseEntity<Void> requestPhoneVerify(@AuthenticationPrincipal User user, @RequestBody Map<String, String> body) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        String phoneNumber = body.get("phoneNumber");
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        userService.requestPhoneVerify(user, phoneNumber);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-phone")
    public ResponseEntity<UserDTO> verifyPhone(@AuthenticationPrincipal User user, @RequestBody Map<String, String> body) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        String otp = body.get("otp");
        if (otp == null || otp.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            UserDTO response = userService.verifyPhone(user, otp);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        try {
            userService.changePassword(user, request);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-id")
    public ResponseEntity<UserDTO> verifyGovtId(@AuthenticationPrincipal User user, @RequestBody Map<String, String> body) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        String idNumber = body.get("idNumber");
        String idUrl = body.get("idUrl");
        if (idNumber == null || idNumber.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        UserDTO response = userService.submitGovtId(user, idNumber, idUrl);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-gst")
    public ResponseEntity<UserDTO> verifyGst(@AuthenticationPrincipal User user, @RequestBody Map<String, String> body) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        String gstNumber = body.get("gstNumber");
        if (gstNumber == null || gstNumber.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        UserDTO response = userService.submitGst(user, gstNumber);
        return ResponseEntity.ok(response);
    }

    /** Bootstrap endpoint: logged-in user can become ADMIN using secret key */
    @PostMapping("/make-admin")
    public ResponseEntity<?> makeAdmin(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        if (user == null) return ResponseEntity.status(401).build();
        String secret = body.getOrDefault("secret", "");
        if (!"RENTOVA_ADMIN_2025".equals(secret)) {
            return ResponseEntity.status(403).body(Map.of("message", "Invalid secret"));
        }
        return ResponseEntity.ok(userService.makeAdmin(user));
    }
}
