package com.rentova.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SendMessageRequest {
    @NotBlank(message = "Booking ID is required")
    private String bookingId;

    @NotBlank(message = "Message cannot be empty")
    @Size(max = 2000)
    private String content;
}
