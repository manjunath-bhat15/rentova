package com.rentova.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * User entity representing customers, vendors, and admins.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String name;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(columnDefinition = "TEXT")
    private String avatar;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String address;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
    
    @Column(nullable = false)
    @Builder.Default
    private boolean isVerified = false;

    @Column(nullable = true)
    @Builder.Default
    private boolean phoneVerified = false;

    private String phoneNumber;

    @Column(nullable = true)
    @Builder.Default
    private boolean govtIdVerified = false;

    private String govtIdNumber;
    
    @Column(columnDefinition = "TEXT")
    private String govtIdUrl;

    @Column(nullable = true)
    @Builder.Default
    private boolean gstVerified = false;

    private String gstNumber;

    @Column(nullable = true)
    @Builder.Default
    private int trustScore = 10;
    
    @Column(nullable = false)
    @Builder.Default
    private int totalOrders = 0;

    @Column(nullable = false)
    @Builder.Default
    private int totalRatings = 0;

    @Column(nullable = false)
    @Builder.Default
    private double rating = 0.0;
    
    @JsonIgnore
    private String otpCode;

    @JsonIgnore
    @ToString.Exclude
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Wallet wallet;

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
