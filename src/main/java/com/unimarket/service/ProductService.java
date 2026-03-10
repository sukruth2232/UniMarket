package com.unimarket.service;

import com.unimarket.dto.request.ProductRequest;
import com.unimarket.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {
    ProductResponse createProduct(ProductRequest request, String username);
    ProductResponse updateProduct(Long id, ProductRequest request, String username);
    void deleteProduct(Long id, String username);
    ProductResponse getProductById(Long id);
    Page<ProductResponse> getAllAvailableProducts(Pageable pageable);
    Page<ProductResponse> searchProducts(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String keyword, Pageable pageable);
    ProductResponse addProductImages(Long productId, List<MultipartFile> files, String username);
    ProductResponse markAsSold(Long productId, String username);
}
