package com.unimarket.service;

import com.unimarket.dto.request.LoginRequest;
import com.unimarket.dto.request.RegisterRequest;
import com.unimarket.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
