package com.smartstock.service;

import com.smartstock.dto.ProductRequest;
import com.smartstock.dto.ProductResponse;
import com.smartstock.entity.Product;
import com.smartstock.exception.BadRequestException;
import com.smartstock.mapper.EntityMapper;
import com.smartstock.repository.ProductRepository;
import com.smartstock.repository.SupplierRepository;
import com.smartstock.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Spy
    private EntityMapper mapper = new EntityMapper();

    @InjectMocks
    private ProductServiceImpl productService;

    private Product product;

    @BeforeEach
    void setUp() {
        product = Product.builder()
                .id(1L)
                .name("Basmati Rice")
                .sku("RICE-01")
                .category("Grocery")
                .purchasePrice(new BigDecimal("10.00"))
                .sellingPrice(new BigDecimal("15.00"))
                .quantity(20)
                .minimumStockLevel(5)
                .build();
    }

    @Test
    @DisplayName("Should create product successfully when SKU is unique")
    void createProduct_Success() {
        when(productRepository.existsBySku("RICE-01")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setId(1L);
            return p;
        });

        ProductRequest request = ProductRequest.builder()
                .name("Basmati Rice")
                .sku("RICE-01")
                .category("Grocery")
                .purchasePrice(new BigDecimal("10.00"))
                .sellingPrice(new BigDecimal("15.00"))
                .quantity(20)
                .minimumStockLevel(5)
                .build();

        ProductResponse response = productService.createProduct(request);

        assertNotNull(response);
        assertEquals("RICE-01", response.getSku());
        assertEquals("IN_STOCK", response.getStockStatus());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when SKU already exists")
    void createProduct_DuplicateSku_ThrowsException() {
        when(productRepository.existsBySku("RICE-01")).thenReturn(true);

        ProductRequest request = ProductRequest.builder()
                .name("Basmati Rice")
                .sku("RICE-01")
                .category("Grocery")
                .purchasePrice(new BigDecimal("10.00"))
                .sellingPrice(new BigDecimal("15.00"))
                .quantity(20)
                .minimumStockLevel(5)
                .build();

        assertThrows(BadRequestException.class, () -> {
            productService.createProduct(request);
        });

        verify(productRepository, never()).save(any(Product.class));
    }
}
