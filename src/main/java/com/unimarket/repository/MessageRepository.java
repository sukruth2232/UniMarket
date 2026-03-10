package com.unimarket.repository;

import com.unimarket.entity.Message;
import com.unimarket.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE m.conversationId = :conversationId ORDER BY m.createdAt ASC")
    List<Message> findByConversationId(@Param("conversationId") String conversationId);

    @Query("SELECT DISTINCT m.conversationId FROM Message m WHERE m.sender = :user OR m.receiver = :user")
    List<String> findDistinctConversationsByUser(@Param("user") User user);

    long countByReceiverAndReadFalse(User receiver);

    @Modifying
    @Query("UPDATE Message m SET m.read = true WHERE m.conversationId = :conversationId AND m.receiver = :user")
    void markConversationAsRead(@Param("conversationId") String conversationId, @Param("user") User user);

    @Query("SELECT m FROM Message m WHERE (m.sender = :user1 AND m.receiver = :user2) OR (m.sender = :user2 AND m.receiver = :user1) ORDER BY m.createdAt ASC")
    List<Message> findConversationBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);

    Page<Message> findByReceiverOrderByCreatedAtDesc(User receiver, Pageable pageable);
}
