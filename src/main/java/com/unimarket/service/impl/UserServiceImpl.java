package com.unimarket.service.impl;

import com.unimarket.dto.request.UpdateProfileRequest;
import com.unimarket.dto.response.ProductResponse;
import com.unimarket.dto.response.UserResponse;
import com.unimarket.entity.Product;
import com.unimarket.entity.User;
import com.unimarket.exception.ResourceNotFoundException;
import com.unimarket.repository.ProductRepository;
import com.unimarket.repository.UserRepository;
import com.unimarket.service.FileStorageService;
import com.unimarket.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final FileStorageService fileStorageService;

    @Override
    public UserResponse getCurrentUser(String username) {
        User user = findByUsername(username);
        return mapToUserResponse(user);
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = findByUsername(username);

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getUniversity() != null) user.setUniversity(request.getUniversity());
        if (request.getBio() != null) user.setBio(request.getBio());

        User updated = userRepository.save(user);
        log.info("User profile updated: {}", username);
        return mapToUserResponse(updated);
    }

    @Override
    @Transactional
    public UserResponse uploadProfileImage(String username, MultipartFile file) {
        User user = findByUsername(username);
        String imageUrl = fileStorageService.storeFile(file, "profiles");
        user.setProfileImageUrl(imageUrl);
        User updated = userRepository.save(user);
        log.info("Profile image uploaded for user: {}", username);
        return mapToUserResponse(updated);
    }

    @Override
    public Page<ProductResponse> getUserListings(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return productRepository.findBySellerAndStatus(user, Product.ProductStatus.AVAILABLE, pageable)
                .map(this::mapToProductResponse);
    }

    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setEnabled(false);
        userRepository.save(user);
        log.info("User disabled: {}", id);
    }

    public UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .profileImageUrl(user.getProfileImageUrl())
                .university(user.getUniversity())
                .bio(user.getBio())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private ProductResponse mapToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .status(product.getStatus())
                .condition(product.getCondition())
                .imageUrls(product.getImageUrls())
                .location(product.getLocation())
                .viewCount(product.getViewCount())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
