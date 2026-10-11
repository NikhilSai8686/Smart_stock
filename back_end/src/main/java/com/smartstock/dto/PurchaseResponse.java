package com.smartstock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseResponse {
    private Long id;
    private String invoiceNumber;
    private Long supplierId;
    private String supplierName;
    private BigDecimal totalCost;
    private List<PurchaseItemResponse> items;
    private LocalDateTime createdAt;
}
