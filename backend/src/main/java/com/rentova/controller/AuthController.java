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
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = userService.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            AuthResponse response = userService.verifyOtp(request);
            return ResponseEntity.ok(response);
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
}
