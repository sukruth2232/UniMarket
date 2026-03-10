package com.unimarket.service.impl;

import com.unimarket.dto.request.ProductRequest;
import com.unimarket.dto.response.CategoryResponse;
import com.unimarket.dto.response.ProductResponse;
import com.unimarket.dto.response.UserResponse;
import com.unimarket.entity.Category;
import com.unimarket.entity.Product;
import com.unimarket.entity.User;
import com.unimarket.exception.BadRequestException;
import com.unimarket.exception.ResourceNotFoundException;
import com.unimarket.exception.UnauthorizedException;
import com.unimarket.repository.CategoryRepository;
import com.unimarket.repository.ProductRepository;
import com.unimarket.service.FileStorageService;
import com.unimarket.service.ProductService;
import com.unimarket.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserService userService;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request, String username) {
        User seller = userService.findByUsername(username);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        Product product = Product.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .condition(request.getCondition())
                .category(category)
                .seller(seller)
                .location(request.getLocation())
                .status(Product.ProductStatus.AVAILABLE)
                .imageUrls(new ArrayList<>())
                .build();

        Product saved = productRepository.save(product);
        log.info("Product created: {} by {}", saved.getTitle(), username);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request, String username) {
        Product product = getProductOrThrow(id);
        validateOwnership(product, username);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCondition(request.getCondition());
        product.setCategory(category);
        if (request.getLocation() != null) product.setLocation(request.getLocation());

        Product updated = productRepository.save(product);
        log.info("Product updated: {}", id);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id, String username) {
        Product product = getProductOrThrow(id);
        validateOwnership(product, username);
        product.setStatus(Product.ProductStatus.INACTIVE);
        productRepository.save(product);
        log.info("Product deactivated: {}", id);
    }

    @Override
    @Transactional
    public ProductResponse getProductById(Long id) {
        Product product = getProductOrThrow(id);
        productRepository.incrementViewCount(id);
        return mapToResponse(product);
    }

    @Override
    public Page<ProductResponse> getAllAvailableProducts(Pageable pageable) {
        return productRepository.findByStatus(Product.ProductStatus.AVAILABLE, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public Page<ProductResponse> searchProducts(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice,
                                                  String keyword, Pageable pageable) {
        return productRepository.searchProducts(categoryId, minPrice, maxPrice, keyword, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public ProductResponse addProductImages(Long productId, List<MultipartFile> files, String username) {
        Product product = getProductOrThrow(productId);
        validateOwnership(product, username);

        if (product.getImageUrls().size() + files.size() > 5) {
            throw new BadRequestException("Maximum 5 images allowed per product");
        }

        List<String> imageUrls = files.stream()
                .map(f -> fileStorageService.storeFile(f, "products"))
                .collect(Collectors.toList());

        product.getImageUrls().addAll(imageUrls);
        Product updated = productRepository.save(product);
        log.info("Images added to product: {}", productId);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public ProductResponse markAsSold(Long productId, String username) {
        Product product = getProductOrThrow(productId);
        validateOwnership(product, username);
        product.setStatus(Product.ProductStatus.SOLD);
        Product updated = productRepository.save(product);
        log.info("Product marked as sold: {}", productId);
        return mapToResponse(updated);
    }

    private Product getProductOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    private void validateOwnership(Product product, String username) {
        User currentUser = userService.findByUsername(username);
        if (!product.getSeller().getId().equals(currentUser.getId()) &&
                currentUser.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("You are not authorized to modify this product");
        }
    }

    public ProductResponse mapToResponse(Product product) {
        UserResponse sellerResponse = UserResponse.builder()
                .id(product.getSeller().getId())
                .username(product.getSeller().getUsername())
                .email(product.getSeller().getEmail())
                .firstName(product.getSeller().getFirstName())
                .lastName(product.getSeller().getLastName())
                .profileImageUrl(product.getSeller().getProfileImageUrl())
                .university(product.getSeller().getUniversity())
                .build();

        CategoryResponse categoryResponse = CategoryResponse.builder()
                .id(product.getCategory().getId())
                .name(product.getCategory().getName())
                .description(product.getCategory().getDescription())
                .imageUrl(product.getCategory().getImageUrl())
                .build();

        return ProductResponse.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .status(product.getStatus())
                .condition(product.getCondition())
                .category(categoryResponse)
                .seller(sellerResponse)
                .imageUrls(product.getImageUrls())
                .location(product.getLocation())
                .viewCount(product.getViewCount())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
