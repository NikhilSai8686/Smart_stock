package com.smartstock.service;

import com.smartstock.dto.PurchaseItemRequest;
import com.smartstock.dto.PurchaseRequest;
import com.smartstock.dto.PurchaseResponse;
import com.smartstock.entity.Product;
import com.smartstock.entity.Purchase;
import com.smartstock.entity.StockMovement;
import com.smartstock.entity.Supplier;
import com.smartstock.mapper.EntityMapper;
import com.smartstock.repository.ProductRepository;
import com.smartstock.repository.PurchaseRepository;
import com.smartstock.repository.StockMovementRepository;
import com.smartstock.repository.SupplierRepository;
import com.smartstock.service.impl.PurchaseServiceImpl;
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
class PurchaseServiceTest {

    @Mock
    private PurchaseRepository purchaseRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private StockMovementRepository stockMovementRepository;

    @Spy
    private EntityMapper mapper = new EntityMapper();

    @InjectMocks
    private PurchaseServiceImpl purchaseService;

    private Product product;
    private Supplier supplier;

    @BeforeEach
    void setUp() {
        product = Product.builder()
                .id(1L)
                .name("Notebook A4")
                .sku("NOTE-01")
                .category("Stationery")
                .purchasePrice(new BigDecimal("2.00"))
                .sellingPrice(new BigDecimal("4.50"))
                .quantity(15)
                .minimumStockLevel(10)
                .build();

        supplier = Supplier.builder()
                .id(10L)
                .name("Stationery Wholesale")
                .build();
    }

    @Test
    @DisplayName("Should record purchase, increment inventory, and update cost")
    void createPurchase_Success() {
        when(supplierRepository.findById(10L)).thenReturn(Optional.of(supplier));
        when(productRepository.findByIdWithLock(1L)).thenReturn(Optional.of(product));
        when(purchaseRepository.save(any(Purchase.class))).thenAnswer(invocation -> {
            Purchase p = invocation.getArgument(0);
            p.setId(50L);
            return p;
        });

        PurchaseRequest request = PurchaseRequest.builder()
                .supplierId(10L)
                .items(List.of(new PurchaseItemRequest(1L, 25, new BigDecimal("2.20"))))
                .build();

        PurchaseResponse response = purchaseService.createPurchase(request);

        assertNotNull(response);
        assertEquals(50L, response.getId());
        assertEquals(new BigDecimal("55.00"), response.getTotalCost()); // 25 * 2.20
        assertEquals(40, product.getQuantity()); // 15 + 25 = 40
        assertEquals(new BigDecimal("2.20"), product.getPurchasePrice()); // updated cost

        verify(productRepository).save(product);
        verify(stockMovementRepository).save(any(StockMovement.class));
        verify(purchaseRepository).save(any(Purchase.class));
    }
}
