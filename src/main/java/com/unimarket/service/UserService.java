package com.unimarket.service;

import com.unimarket.dto.request.UpdateProfileRequest;
import com.unimarket.dto.response.ProductResponse;
import com.unimarket.dto.response.UserResponse;
import com.unimarket.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    UserResponse getCurrentUser(String username);
    UserResponse getUserById(Long id);
    UserResponse updateProfile(String username, UpdateProfileRequest request);
    UserResponse uploadProfileImage(String username, MultipartFile file);
    Page<ProductResponse> getUserListings(Long userId, Pageable pageable);
    User findByUsername(String username);
    void deleteUser(Long id);
}
