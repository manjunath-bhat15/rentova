package com.rentova.service;

import com.rentova.dto.*;
import com.rentova.model.*;
import com.rentova.repository.BookingRepository;
import com.rentova.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatRepo;
    private final BookingRepository bookingRepo;

    @Transactional
    public ChatMessageDTO sendMessage(String bookingId, String content, User sender) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Only customer or vendor of this booking can chat
        boolean isCustomer = booking.getCustomer().getId().equals(sender.getId());
        boolean isVendor = booking.getVendor().getId().equals(sender.getId());
        if (!isCustomer && !isVendor && sender.getRole() != Role.ADMIN) {
            throw new RuntimeException("Not authorized to send messages in this booking");
        }

        String recipientId = isCustomer ? booking.getVendor().getId() : booking.getCustomer().getId();

        ChatMessage msg = ChatMessage.builder()
                .bookingId(bookingId)
                .senderId(sender.getId())
                .senderName(sender.getName())
                .recipientId(recipientId)
                .content(content)
                .isRead(false)
                .build();

        msg = chatRepo.save(msg);
        return toDTO(msg);
    }

    public List<ChatMessageDTO> getConversation(String bookingId, User user) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        boolean isParty = booking.getCustomer().getId().equals(user.getId())
                || booking.getVendor().getId().equals(user.getId())
                || user.getRole() == Role.ADMIN;
        if (!isParty) {
            throw new RuntimeException("Not authorized");
        }

        // Mark messages as read for the current user
        List<ChatMessage> unread = chatRepo.findByBookingIdAndRecipientIdAndIsReadFalse(bookingId, user.getId());
        unread.forEach(m -> m.setRead(true));
        chatRepo.saveAll(unread);

        return chatRepo.findByBookingIdOrderByCreatedAtAsc(bookingId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ConversationDTO> getConversations(User user) {
        List<Booking> bookings;
        switch (user.getRole()) {
            case CUSTOMER -> bookings = bookingRepo.findByCustomerIdOrderByCreatedAtDesc(user.getId());
            case VENDOR -> bookings = bookingRepo.findByVendorIdOrderByCreatedAtDesc(user.getId());
            case ADMIN -> bookings = bookingRepo.findAll();
            default -> bookings = List.of();
        }

        List<ConversationDTO> conversations = new ArrayList<>();

        for (Booking booking : bookings) {
            List<ChatMessage> messages = chatRepo.findByBookingIdOrderByCreatedAtAsc(booking.getId());

            ChatMessage lastMsg = messages.isEmpty() ? null : messages.get(messages.size() - 1);
            long unread = chatRepo.countByBookingIdAndRecipientIdAndIsReadFalse(booking.getId(), user.getId());

            boolean isCustomer = booking.getCustomer().getId().equals(user.getId());
            boolean isVendor = booking.getVendor().getId().equals(user.getId());
            String otherName = isCustomer
                    ? booking.getVendor().getName()
                    : isVendor
                        ? booking.getCustomer().getName()
                        : booking.getCustomer().getName() + " / " + booking.getVendor().getName();
            String otherId = isCustomer ? booking.getVendor().getId() : booking.getCustomer().getId();

            conversations.add(ConversationDTO.builder()
                    .bookingId(booking.getId())
                    .serviceTitle(booking.getService().getTitle())
                    .otherPartyName(otherName)
                    .otherPartyId(otherId)
                    .lastMessage(lastMsg == null ? "Start the conversation" : lastMsg.getContent())
                    .lastMessageTime((lastMsg == null ? booking.getCreatedAt() : lastMsg.getCreatedAt()).toString())
                    .unreadCount(unread)
                    .build());
        }

        conversations.sort(Comparator.comparing(ConversationDTO::getLastMessageTime).reversed());
        return conversations;
    }

    private ChatMessageDTO toDTO(ChatMessage m) {
        return ChatMessageDTO.builder()
                .id(m.getId())
                .bookingId(m.getBookingId())
                .senderId(m.getSenderId())
                .senderName(m.getSenderName())
                .recipientId(m.getRecipientId())
                .content(m.getContent())
                .read(m.isRead())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
