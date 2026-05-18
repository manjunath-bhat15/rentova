package com.rentova.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageDTO {
    private String id;
    private String bookingId;
    private String senderId;
    private String senderName;
    private String recipientId;
    private String content;
    private boolean read;
    private LocalDateTime createdAt;
}
