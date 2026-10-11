package com.smartstock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpiryAlertDto {
    private Long productId;
    private String productName;
    private String sku;
    private String category;
    private Integer currentStock;
    private LocalDate expiryDate;
    private long daysRemaining;
    private String status; // "EXPIRED", "EXPIRING_SOON"
}
