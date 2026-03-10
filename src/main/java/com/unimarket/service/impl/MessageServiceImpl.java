package com.unimarket.service.impl;

import com.unimarket.dto.request.MessageRequest;
import com.unimarket.dto.response.MessageResponse;
import com.unimarket.entity.Message;
import com.unimarket.entity.Notification;
import com.unimarket.entity.Product;
import com.unimarket.entity.User;
import com.unimarket.exception.BadRequestException;
import com.unimarket.exception.ResourceNotFoundException;
import com.unimarket.repository.MessageRepository;
import com.unimarket.repository.ProductRepository;
import com.unimarket.repository.UserRepository;
import com.unimarket.service.MessageService;
import com.unimarket.service.NotificationService;
import com.unimarket.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public MessageResponse sendMessage(MessageRequest request, String senderUsername) {
        User sender = userService.findByUsername(senderUsername);
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getReceiverId()));

        if (sender.getId().equals(receiver.getId())) {
            throw new BadRequestException("Cannot send message to yourself");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        String conversationId = generateConversationId(sender.getId(), receiver.getId(), product.getId());

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .product(product)
                .content(request.getContent())
                .conversationId(conversationId)
                .read(false)
                .build();

        Message saved = messageRepository.save(message);
        MessageResponse response = mapToResponse(saved);

        // Send real-time message via WebSocket
        messagingTemplate.convertAndSendToUser(
                receiver.getUsername(),
                "/queue/messages",
                response
        );

        // Send notification to receiver
        notificationService.sendNotification(
                receiver,
                "New Message from " + sender.getUsername(),
                sender.getUsername() + " sent you a message about: " + product.getTitle(),
                Notification.NotificationType.NEW_MESSAGE,
                saved.getId()
        );

        log.info("Message sent from {} to {} about product {}", senderUsername, receiver.getUsername(), product.getId());
        return response;
    }

    @Override
    public List<MessageResponse> getConversation(String conversationId, String username) {
        return messageRepository.findByConversationId(conversationId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getUserConversations(String username) {
        User user = userService.findByUsername(username);
        List<String> conversationIds = messageRepository.findDistinctConversationsByUser(user);

        return conversationIds.stream()
                .map(convId -> {
                    List<Message> messages = messageRepository.findByConversationId(convId);
                    if (messages.isEmpty()) return null;
                    Message lastMessage = messages.get(messages.size() - 1);

                    Map<String, Object> conversation = new HashMap<>();
                    conversation.put("conversationId", convId);
                    conversation.put("lastMessage", mapToResponse(lastMessage));
                    conversation.put("otherUser", lastMessage.getSender().getUsername().equals(username)
                            ? lastMessage.getReceiver().getUsername()
                            : lastMessage.getSender().getUsername());
                    conversation.put("productTitle", lastMessage.getProduct() != null
                            ? lastMessage.getProduct().getTitle() : null);
                    return conversation;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markConversationAsRead(String conversationId, String username) {
        User user = userService.findByUsername(username);
        messageRepository.markConversationAsRead(conversationId, user);
    }

    @Override
    public long getUnreadMessageCount(String username) {
        User user = userService.findByUsername(username);
        return messageRepository.countByReceiverAndReadFalse(user);
    }

    @Override
    public Page<MessageResponse> getReceivedMessages(String username, Pageable pageable) {
        User user = userService.findByUsername(username);
        return messageRepository.findByReceiverOrderByCreatedAtDesc(user, pageable)
                .map(this::mapToResponse);
    }

    private String generateConversationId(Long userId1, Long userId2, Long productId) {
        long minId = Math.min(userId1, userId2);
        long maxId = Math.max(userId1, userId2);
        return "conv_" + minId + "_" + maxId + "_prod_" + productId;
    }

    private MessageResponse mapToResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderUsername(message.getSender().getUsername())
                .senderProfileImage(message.getSender().getProfileImageUrl())
                .receiverId(message.getReceiver().getId())
                .receiverUsername(message.getReceiver().getUsername())
                .productId(message.getProduct() != null ? message.getProduct().getId() : null)
                .productTitle(message.getProduct() != null ? message.getProduct().getTitle() : null)
                .content(message.getContent())
                .read(message.isRead())
                .conversationId(message.getConversationId())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
