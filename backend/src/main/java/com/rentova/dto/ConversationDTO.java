package com.rentova.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConversationDTO {
    private String bookingId;
    private String serviceTitle;
    private String otherPartyName;
    private String otherPartyId;
    private String lastMessage;
    private String lastMessageTime;
    private long unreadCount;
}
