package com.smartstock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
    private long totalProducts;
    private long totalSales;
    private BigDecimal totalRevenue;
    private BigDecimal estimatedProfit;
    private long lowStockCount;
    private List<SaleResponse> recentSales;
    private List<LowStockAlertDto> lowStockAlerts;
    private List<ExpiryAlertDto> expiryAlerts;
    private List<SalesChartDto> dailySales;
    private List<SalesChartDto> monthlySales;
}
