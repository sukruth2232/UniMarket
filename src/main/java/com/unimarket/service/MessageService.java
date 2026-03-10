package com.unimarket.service;

import com.unimarket.dto.request.MessageRequest;
import com.unimarket.dto.response.MessageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface MessageService {
    MessageResponse sendMessage(MessageRequest request, String senderUsername);
    List<MessageResponse> getConversation(String conversationId, String username);
    List<Map<String, Object>> getUserConversations(String username);
    void markConversationAsRead(String conversationId, String username);
    long getUnreadMessageCount(String username);
    Page<MessageResponse> getReceivedMessages(String username, Pageable pageable);
}
