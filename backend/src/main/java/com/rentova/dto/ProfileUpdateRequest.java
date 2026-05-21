package com.rentova.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfileUpdateRequest {
    @NotBlank
    private String name;

    private String avatar;
    private String phone;
    private String bio;
    private String address;
}
