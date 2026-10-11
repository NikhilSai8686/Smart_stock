package com.smartstock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesChartDto {
    private String label; // "2026-10-01" or "Oct 2026"
    private long salesCount;
    private BigDecimal revenue;
    private BigDecimal profit;
}
