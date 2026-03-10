package com.unimarket.controller;

import com.unimarket.dto.response.ApiResponse;
import com.unimarket.dto.response.OrderResponse;
import com.unimarket.dto.response.ProductResponse;
import com.unimarket.dto.response.UserResponse;
import com.unimarket.entity.Product;
import com.unimarket.repository.OrderRepository;
import com.unimarket.repository.ProductRepository;
import com.unimarket.repository.UserRepository;
import com.unimarket.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin", description = "Admin-only management APIs")
public class AdminController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserService userService;

    @GetMapping("/stats")
    @Operation(summary = "Get platform statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalProducts", productRepository.count());
        stats.put("availableProducts", productRepository.findByStatus(
                Product.ProductStatus.AVAILABLE, PageRequest.of(0, 1)).getTotalElements());
        stats.put("soldProducts", productRepository.findByStatus(
                Product.ProductStatus.SOLD, PageRequest.of(0, 1)).getTotalElements());
        stats.put("totalOrders", orderRepository.count());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/users")
    @Operation(summary = "Get all users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<UserResponse> users = userRepository.findAll(pageable)
                .map(user -> userService.getUserById(user.getId()));
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/products")
    @Operation(summary = "Get all products (admin view)")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getAllProductsAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        // This uses findAll() for admin - all statuses visible
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        // Return placeholder - full implementation would use product service with admin flag
        return ResponseEntity.ok(ApiResponse.success(Page.empty()));
    }

    @GetMapping("/orders")
    @Operation(summary = "Get all orders (admin view)")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(Page.empty()));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete (disable) a user account")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }
}
