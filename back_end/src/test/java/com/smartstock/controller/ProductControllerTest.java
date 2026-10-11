package com.smartstock.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartstock.dto.ProductRequest;
import com.smartstock.entity.Product;
import com.smartstock.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @BeforeEach
    void setup() {
        if (!productRepository.existsBySku("INT-TEST-001")) {
            Product p = Product.builder()
                    .name("Integration Test Item")
                    .sku("INT-TEST-001")
                    .category("Test")
                    .purchasePrice(new BigDecimal("10.00"))
                    .sellingPrice(new BigDecimal("15.00"))
                    .quantity(50)
                    .minimumStockLevel(10)
                    .build();
            productRepository.save(p);
        }
    }

    @Test
    @WithMockUser(username = "staff@smartstock.com", roles = {"STAFF"})
    @DisplayName("GET /api/products should return paginated list")
    void getProducts_Success() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @WithMockUser(username = "staff@smartstock.com", roles = {"STAFF"})
    @DisplayName("POST /api/products should create product")
    void createProduct_Success() throws Exception {
        ProductRequest request = ProductRequest.builder()
                .name("New Widget")
                .sku("WIDGET-99")
                .category("Hardware")
                .purchasePrice(new BigDecimal("5.00"))
                .sellingPrice(new BigDecimal("9.99"))
                .quantity(100)
                .minimumStockLevel(10)
                .build();

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.sku", is("WIDGET-99")));
    }
}
