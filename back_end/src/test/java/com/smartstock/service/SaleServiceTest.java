package com.smartstock.service;

import com.smartstock.dto.SaleItemRequest;
import com.smartstock.dto.SaleRequest;
import com.smartstock.dto.SaleResponse;
import com.smartstock.entity.*;
import com.smartstock.exception.InsufficientStockException;
import com.smartstock.mapper.EntityMapper;
import com.smartstock.repository.ProductRepository;
import com.smartstock.repository.SaleRepository;
import com.smartstock.repository.StockMovementRepository;
import com.smartstock.repository.UserRepository;
import com.smartstock.security.UserPrincipal;
import com.smartstock.service.impl.SaleServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SaleServiceTest {

    @Mock
    private SaleRepository saleRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private StockMovementRepository stockMovementRepository;

    @Mock
    private UserRepository userRepository;

    @Spy
    private EntityMapper mapper = new EntityMapper();

    @InjectMocks
    private SaleServiceImpl saleService;

    private Product product;
    private User user;
    private UserPrincipal userPrincipal;

    @BeforeEach
    void setUp() {
        product = Product.builder()
                .id(1L)
                .name("Organic Milk")
                .sku("MILK-01")
                .category("Grocery")
                .purchasePrice(new BigDecimal("3.00"))
                .sellingPrice(new BigDecimal("5.00"))
                .quantity(10)
                .minimumStockLevel(5)
                .build();

        user = User.builder()
                .id(1L)
                .fullName("John Doe")
                .email("john@smartstock.com")
                .role(Role.STAFF)
                .enabled(true)
                .build();

        userPrincipal = new UserPrincipal(user);
    }

    @Test
    @DisplayName("Should create sale successfully when sufficient stock exists")
    void createSale_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findByIdWithLock(1L)).thenReturn(Optional.of(product));
        when(saleRepository.save(any(Sale.class))).thenAnswer(invocation -> {
            Sale s = invocation.getArgument(0);
            s.setId(100L);
            return s;
        });

        SaleRequest request = SaleRequest.builder()
                .items(List.of(new SaleItemRequest(1L, 3)))
                .discount(BigDecimal.ZERO)
                .tax(new BigDecimal("1.20"))
                .build();

        SaleResponse response = saleService.createSale(request, userPrincipal);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals(new BigDecimal("15.00"), response.getSubtotal());
        assertEquals(new BigDecimal("16.20"), response.getGrandTotal());
        assertEquals(7, product.getQuantity()); // 10 - 3

        verify(productRepository).save(product);
        verify(stockMovementRepository).save(any(StockMovement.class));
        verify(saleRepository).save(any(Sale.class));
    }

    @Test
    @DisplayName("Should throw InsufficientStockException when requested quantity exceeds available stock")
    void createSale_InsufficientStock_ThrowsException() {
        when(productRepository.findByIdWithLock(1L)).thenReturn(Optional.of(product));

        SaleRequest request = SaleRequest.builder()
                .items(List.of(new SaleItemRequest(1L, 15))) // available is only 10
                .build();

        assertThrows(InsufficientStockException.class, () -> {
            saleService.createSale(request, userPrincipal);
        });

        assertEquals(10, product.getQuantity()); // untouched
        verify(saleRepository, never()).save(any(Sale.class));
        verify(stockMovementRepository, never()).save(any(StockMovement.class));
    }
}
