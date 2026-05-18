package com.rentova.repository;

import com.rentova.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    List<ChatMessage> findByBookingIdOrderByCreatedAtAsc(String bookingId);

    @Query("SELECT DISTINCT c.bookingId FROM ChatMessage c WHERE c.senderId = ?1 OR c.recipientId = ?1")
    List<String> findDistinctBookingIdsByUserId(String userId);

    long countByRecipientIdAndIsReadFalse(String recipientId);

    List<ChatMessage> findByBookingIdAndRecipientIdAndIsReadFalse(String bookingId, String recipientId);
}
