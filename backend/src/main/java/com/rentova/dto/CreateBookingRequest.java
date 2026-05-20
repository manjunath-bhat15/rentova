package com.rentova.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateBookingRequest {
    @NotBlank(message = "Service ID is required")
    private String serviceId;

    private LocalDateTime scheduledAt;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity = 1;

    @Size(max = 200)
    private String location;

    private Double latitude;

    private Double longitude;

    @Size(max = 1000)
    private String notes;

    @NotBlank(message = "Fulfillment model is required (PICKUP or DELIVERY)")
    private String fulfillmentModel;
}
