package com.rentova.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages", indexes = {
    @Index(name = "idx_chat_booking", columnList = "booking_id"),
    @Index(name = "idx_chat_created", columnList = "createdAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    /** Booking this conversation belongs to */
    @Column(name = "booking_id", nullable = false)
    private String bookingId;

    @Column(name = "sender_id", nullable = false)
    private String senderId;

    @Column(nullable = false)
    private String senderName;

    @Column(name = "recipient_id", nullable = false)
    private String recipientId;

    @Column(nullable = false, length = 2000)
    private String content;

    @Builder.Default
    private boolean isRead = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
