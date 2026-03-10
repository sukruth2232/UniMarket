package com.unimarket.dto.response;

import com.unimarket.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private Product.ProductStatus status;
    private Product.ProductCondition condition;
    private CategoryResponse category;
    private UserResponse seller;
    private List<String> imageUrls;
    private String location;
    private int viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
