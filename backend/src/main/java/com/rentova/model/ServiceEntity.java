package com.rentova.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Service entity representing a rentable service/resource offered by a vendor.
 */
@Entity
@Table(name = "services")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @JsonIgnore
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private User vendor;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerUnit;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal securityDeposit = BigDecimal.ZERO;

    @Builder.Default
    private boolean allowPickup = true;

    @Builder.Default
    private boolean allowDelivery = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceUnit unit;

    @Builder.Default
    private boolean isActive = true;

    private String location;

    private Double latitude;

    private Double longitude;

    @Builder.Default
    private Double serviceRadiusKm = 10.0;
    
    @Column(columnDefinition = "TEXT")
    private String images;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
