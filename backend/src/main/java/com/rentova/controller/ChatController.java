package com.rentova.controller;

import com.rentova.dto.*;
import com.rentova.model.User;
import com.rentova.model.NotificationType;
import com.rentova.service.ChatService;
import com.rentova.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getConversations(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(chatService.getConversations(user));
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<List<ChatMessageDTO>> getConversation(
            @PathVariable String bookingId,
            @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(chatService.getConversation(bookingId, user));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<ChatMessageDTO> sendMessage(
            @Valid @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal User user) {
        try {
            ChatMessageDTO msg = chatService.sendMessage(request.getBookingId(), request.getContent(), user);

            notificationService.createNotification(
                    msg.getRecipientId(),
                    NotificationType.CHAT_MESSAGE,
                    "New message from " + msg.getSenderName(),
                    msg.getContent(),
                    msg.getBookingId());

            // Push to recipient via WebSocket
            try {
                messagingTemplate.convertAndSendToUser(
                        msg.getRecipientId(), "/queue/chat", msg);
            } catch (Exception e) {
                // Recipient may not be connected
            }

            return ResponseEntity.ok(msg);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
