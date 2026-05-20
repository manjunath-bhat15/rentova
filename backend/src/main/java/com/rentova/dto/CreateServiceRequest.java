package com.rentova.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateServiceRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;

    @Size(max = 2000)
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal pricePerUnit;

    @NotBlank(message = "Unit is required")
    private String unit;  // HOUR, DAY, PIECE, SESSION

    @Size(max = 200)
    private String location;

    private Double latitude;

    private Double longitude;

    @DecimalMin(value = "1.0", message = "Service radius must be at least 1 km")
    private Double serviceRadiusKm = 10.0;

    private String images;

    private Boolean allowPickup;

    private Boolean allowDelivery;

    private BigDecimal securityDeposit;
}
