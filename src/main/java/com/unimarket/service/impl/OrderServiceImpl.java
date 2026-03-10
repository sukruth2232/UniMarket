package com.unimarket.service.impl;

import com.unimarket.dto.request.OrderRequest;
import com.unimarket.dto.response.OrderResponse;
import com.unimarket.dto.response.ProductResponse;
import com.unimarket.dto.response.UserResponse;
import com.unimarket.entity.Notification;
import com.unimarket.entity.Order;
import com.unimarket.entity.Product;
import com.unimarket.entity.User;
import com.unimarket.exception.BadRequestException;
import com.unimarket.exception.ResourceNotFoundException;
import com.unimarket.exception.UnauthorizedException;
import com.unimarket.repository.OrderRepository;
import com.unimarket.repository.ProductRepository;
import com.unimarket.service.NotificationService;
import com.unimarket.service.OrderService;
import com.unimarket.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final ProductServiceImpl productServiceImpl;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request, String buyerUsername) {
        User buyer = userService.findByUsername(buyerUsername);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (product.getStatus() != Product.ProductStatus.AVAILABLE) {
            throw new BadRequestException("Product is not available for purchase");
        }
        if (product.getSeller().getId().equals(buyer.getId())) {
            throw new BadRequestException("Cannot purchase your own product");
        }
        if (orderRepository.existsByProductId(product.getId())) {
            throw new BadRequestException("An order already exists for this product");
        }

        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .product(product)
                .buyer(buyer)
                .seller(product.getSeller())
                .amount(product.getPrice())
                .status(Order.OrderStatus.PENDING)
                .notes(request.getNotes())
                .build();

        product.setStatus(Product.ProductStatus.RESERVED);
        productRepository.save(product);

        Order saved = orderRepository.save(order);

        // Notify seller
        notificationService.sendNotification(
                product.getSeller(),
                "New Order Received!",
                buyer.getUsername() + " wants to purchase your item: " + product.getTitle(),
                Notification.NotificationType.ORDER_UPDATE,
                saved.getId()
        );

        log.info("Order created: {} for product: {} by buyer: {}", orderNumber, product.getTitle(), buyerUsername);
        return mapToResponse(saved);
    }

    @Override
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return mapToResponse(order);
    }

    @Override
    public OrderResponse getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));
        return mapToResponse(order);
    }

    @Override
    public Page<OrderResponse> getBuyerOrders(String username, Pageable pageable) {
        User buyer = userService.findByUsername(username);
        return orderRepository.findByBuyerOrderByCreatedAtDesc(buyer, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public Page<OrderResponse> getSellerOrders(String username, Pageable pageable) {
        User seller = userService.findByUsername(username);
        return orderRepository.findBySellerOrderByCreatedAtDesc(seller, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(Long id, String username) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        User user = userService.findByUsername(username);
        if (!order.getBuyer().getId().equals(user.getId()) &&
                !order.getSeller().getId().equals(user.getId())) {
            throw new UnauthorizedException("Not authorized to cancel this order");
        }
        if (order.getStatus() == Order.OrderStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed order");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.getProduct().setStatus(Product.ProductStatus.AVAILABLE);
        productRepository.save(order.getProduct());

        Order updated = orderRepository.save(order);
        log.info("Order cancelled: {}", id);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public OrderResponse completeOrder(Long id, String username) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        User seller = userService.findByUsername(username);
        if (!order.getSeller().getId().equals(seller.getId())) {
            throw new UnauthorizedException("Only the seller can complete an order");
        }
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new BadRequestException("Order is not in pending status");
        }

        order.setStatus(Order.OrderStatus.COMPLETED);
        order.getProduct().setStatus(Product.ProductStatus.SOLD);
        productRepository.save(order.getProduct());

        Order updated = orderRepository.save(order);

        // Notify buyer
        notificationService.sendNotification(
                order.getBuyer(),
                "Order Completed",
                "Your purchase of " + order.getProduct().getTitle() + " has been confirmed!",
                Notification.NotificationType.ORDER_UPDATE,
                updated.getId()
        );

        log.info("Order completed: {}", id);
        return mapToResponse(updated);
    }

    private OrderResponse mapToResponse(Order order) {
        UserResponse buyerResponse = UserResponse.builder()
                .id(order.getBuyer().getId())
                .username(order.getBuyer().getUsername())
                .email(order.getBuyer().getEmail())
                .firstName(order.getBuyer().getFirstName())
                .lastName(order.getBuyer().getLastName())
                .build();

        UserResponse sellerResponse = UserResponse.builder()
                .id(order.getSeller().getId())
                .username(order.getSeller().getUsername())
                .email(order.getSeller().getEmail())
                .firstName(order.getSeller().getFirstName())
                .lastName(order.getSeller().getLastName())
                .build();

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .product(productServiceImpl.mapToResponse(order.getProduct()))
                .buyer(buyerResponse)
                .seller(sellerResponse)
                .amount(order.getAmount())
                .status(order.getStatus())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
