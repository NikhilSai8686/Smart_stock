package com.smartstock.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartstock.dto.LoginRequest;
import com.smartstock.dto.RegisterRequest;
import com.smartstock.entity.Role;
import com.smartstock.entity.User;
import com.smartstock.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setup() {
        if (!userRepository.existsByEmail("testuser@smartstock.com")) {
            User user = User.builder()
                    .fullName("Test User")
                    .email("testuser@smartstock.com")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(user);
        }
    }

    @Test
    @DisplayName("POST /api/auth/login should return 200 and JWT on valid credentials")
    void login_Success() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("testuser@smartstock.com")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.user.email", is("testuser@smartstock.com")));
    }

    @Test
    @DisplayName("POST /api/auth/login should return 401 on invalid credentials")
    void login_InvalidCredentials() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("testuser@smartstock.com")
                .password("wrongpassword")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)));
    }

    @Test
    @DisplayName("POST /api/auth/register should create staff account")
    void register_Success() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("New Cashier")
                .email("newcashier@smartstock.com")
                .password("cashier123")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is("newcashier@smartstock.com")))
                .andExpect(jsonPath("$.data.role", is("STAFF")));
    }
}
