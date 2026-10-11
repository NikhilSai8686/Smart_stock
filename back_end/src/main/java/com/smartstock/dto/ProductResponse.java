package com.smartstock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String sku;
    private String category;
    private BigDecimal purchasePrice;
    private BigDecimal sellingPrice;
    private Integer quantity;
    private Integer minimumStockLevel;
    private LocalDate expiryDate;
    private Long supplierId;
    private String supplierName;
    private String stockStatus; // "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"
    private Boolean isExpired;
    private Boolean isLowStock;
    private LocalDateTime createdAt;
}
