package com.rentova.controller;

import com.rentova.dto.*;
import com.rentova.model.User;
import com.rentova.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    public ResponseEntity<WalletDTO> getWallet(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(walletService.getWallet(user));
    }

    @PostMapping("/topup")
    public ResponseEntity<WalletDTO> topUp(
            @Valid @RequestBody TopUpRequest request,
            @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(walletService.topUp(user, request.getAmount()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
