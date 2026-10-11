package com.smartstock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LowStockAlertDto {
    private Long productId;
    private String productName;
    private String sku;
    private String category;
    private Integer currentStock;
    private Integer minimumStockLevel;
    private String status; // "OUT_OF_STOCK", "CRITICAL", "LOW"
}
