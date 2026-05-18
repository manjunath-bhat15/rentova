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
    private BigDecimal walletBalance;
    private LocalDateTime createdAt;
}
