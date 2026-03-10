package com.unimarket.controller;

import com.unimarket.dto.request.MessageRequest;
import com.unimarket.dto.response.ApiResponse;
import com.unimarket.dto.response.MessageResponse;
import com.unimarket.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Messages", description = "Messaging system APIs")
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    @Operation(summary = "Send a message to another user")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @Valid @RequestBody MessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        MessageResponse response = messageService.sendMessage(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Message sent successfully", response));
    }

    @GetMapping("/conversations")
    @Operation(summary = "Get all conversations for current user")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getUserConversations(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<Map<String, Object>> conversations = messageService.getUserConversations(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(conversations));
    }

    @GetMapping("/conversations/{conversationId}")
    @Operation(summary = "Get messages in a conversation")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getConversation(
            @PathVariable String conversationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<MessageResponse> messages = messageService.getConversation(conversationId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @PatchMapping("/conversations/{conversationId}/read")
    @Operation(summary = "Mark all messages in a conversation as read")
    public ResponseEntity<ApiResponse<Void>> markConversationAsRead(
            @PathVariable String conversationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        messageService.markConversationAsRead(conversationId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Conversation marked as read", null));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread message count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        long count = messageService.getUnreadMessageCount(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/received")
    @Operation(summary = "Get all received messages")
    public ResponseEntity<ApiResponse<Page<MessageResponse>>> getReceivedMessages(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageResponse> messages = messageService.getReceivedMessages(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    // WebSocket message handler
    @MessageMapping("/chat.send")
    public void handleWebSocketMessage(@Payload MessageRequest request, Principal principal) {
        if (principal != null) {
            messageService.sendMessage(request, principal.getName());
        }
    }
}
