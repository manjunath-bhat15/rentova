package com.rentova.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingDTO {
    private String id;
    private String customerId;
    private String customerName;
    private String vendorId;
    private String vendorName;
    private String serviceId;
    private String serviceTitle;
    private String status;
    private LocalDateTime scheduledAt;
    private LocalDateTime completedAt;
    private BigDecimal amount;
    private int quantity;
    private String location;
    private Double latitude;
    private Double longitude;
    private String serviceLocation;
    private Double serviceLatitude;
    private Double serviceLongitude;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
