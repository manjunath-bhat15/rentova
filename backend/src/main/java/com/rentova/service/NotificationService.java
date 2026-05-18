package com.rentova.service;

import com.rentova.dto.NotificationDTO;
import com.rentova.model.Notification;
import com.rentova.model.NotificationType;
import com.rentova.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notifRepo;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Create and persist a notification, then push it via WebSocket.
     */
    @Transactional
    public NotificationDTO createNotification(String userId, NotificationType type,
                                               String title, String message, String referenceId) {
        Notification notif = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .isRead(false)
                .build();

        notif = notifRepo.save(notif);
        NotificationDTO dto = toDTO(notif);

        // Push real-time via WebSocket to specific user
        try {
            messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", dto);
        } catch (Exception e) {
            // User may not be connected — notification is still persisted
        }

        return dto;
    }

    public List<NotificationDTO> getNotifications(String userId) {
        return notifRepo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public long getUnreadCount(String userId) {
        return notifRepo.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(String notificationId) {
        Notification notif = notifRepo.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notif.setRead(true);
        notifRepo.save(notif);
    }

    @Transactional
    public void markAllAsRead(String userId) {
        List<Notification> unread = notifRepo.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notifRepo.saveAll(unread);
    }

    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .type(n.getType().name())
                .title(n.getTitle())
                .message(n.getMessage())
                .referenceId(n.getReferenceId())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
