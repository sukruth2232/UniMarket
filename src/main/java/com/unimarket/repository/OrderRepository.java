package com.unimarket.repository;

import com.unimarket.entity.Order;
import com.unimarket.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByBuyerOrderByCreatedAtDesc(User buyer, Pageable pageable);
    Page<Order> findBySellerOrderByCreatedAtDesc(User seller, Pageable pageable);
    Optional<Order> findByOrderNumber(String orderNumber);
    boolean existsByProductId(Long productId);
}
