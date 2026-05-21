package com.rentova.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class UserDTO {
    private String id;
    private String email;
    private String name;
    private String role;
    private String avatar;
    private String bio;
    private String address;
    private BigDecimal walletBalance;
    private boolean isVerified;
    private boolean phoneVerified;
    private String phoneNumber;
    private boolean govtIdVerified;
    private String govtIdNumber;
    private String govtIdUrl;
    private boolean gstVerified;
    private String gstNumber;
    private int trustScore;
    private LocalDateTime createdAt;
}
