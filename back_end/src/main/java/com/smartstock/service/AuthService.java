package com.smartstock.service;

import com.smartstock.dto.AuthResponse;
import com.smartstock.dto.LoginRequest;
import com.smartstock.dto.RegisterRequest;
import com.smartstock.dto.UserDto;
import com.smartstock.security.UserPrincipal;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    UserDto register(RegisterRequest request);
    UserDto getCurrentUser(UserPrincipal userPrincipal);
}
