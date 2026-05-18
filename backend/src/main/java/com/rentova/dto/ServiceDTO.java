package com.rentova.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ServiceDTO {
    private String id;
    private String vendorId;
    private String vendorName;
    private String title;
    private String description;
    private String category;
    private BigDecimal pricePerUnit;
    private String unit;
    private boolean active;
    private String images;
    private LocalDateTime createdAt;
}
