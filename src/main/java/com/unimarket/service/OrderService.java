package com.unimarket.service;

import com.unimarket.dto.request.OrderRequest;
import com.unimarket.dto.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderResponse createOrder(OrderRequest request, String buyerUsername);
    OrderResponse getOrderById(Long id);
    OrderResponse getOrderByNumber(String orderNumber);
    Page<OrderResponse> getBuyerOrders(String username, Pageable pageable);
    Page<OrderResponse> getSellerOrders(String username, Pageable pageable);
    OrderResponse cancelOrder(Long id, String username);
    OrderResponse completeOrder(Long id, String username);
}
