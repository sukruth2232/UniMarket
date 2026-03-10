package com.unimarket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private Long id;
    private Long senderId;
    private String senderUsername;
    private String senderProfileImage;
    private Long receiverId;
    private String receiverUsername;
    private Long productId;
    private String productTitle;
    private String content;
    private boolean read;
    private String conversationId;
    private LocalDateTime createdAt;
}
