package com.unimarket.util;

public class ConversationIdGenerator {

    private ConversationIdGenerator() {}

    public static String generate(Long userId1, Long userId2, Long productId) {
        long minId = Math.min(userId1, userId2);
        long maxId = Math.max(userId1, userId2);
        return "conv_" + minId + "_" + maxId + "_prod_" + productId;
    }

    public static String generate(Long userId1, Long userId2) {
        long minId = Math.min(userId1, userId2);
        long maxId = Math.max(userId1, userId2);
        return "conv_" + minId + "_" + maxId;
    }
}
