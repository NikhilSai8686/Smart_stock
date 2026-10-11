package com.smartstock.service.impl;

import com.smartstock.dto.*;
import com.smartstock.entity.Product;
import com.smartstock.entity.Sale;
import com.smartstock.entity.SaleItem;
import com.smartstock.mapper.EntityMapper;
import com.smartstock.repository.ProductRepository;
import com.smartstock.repository.SaleRepository;
import com.smartstock.service.AlertService;
import com.smartstock.service.DashboardService;
import com.smartstock.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final AlertService alertService;
    private final ReportService reportService;
    private final EntityMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary() {
        long totalProducts = productRepository.count();
        long totalSales = saleRepository.count();
        BigDecimal totalRevenue = saleRepository.calculateTotalRevenue().setScale(2, RoundingMode.HALF_UP);

        // Calculate all-time profit
        List<Sale> allSales = saleRepository.findAll();
        BigDecimal estimatedProfit = BigDecimal.ZERO;
        for (Sale sale : allSales) {
            BigDecimal saleProfit = BigDecimal.ZERO;
            for (SaleItem item : sale.getItems()) {
                BigDecimal cost = item.getUnitPurchasePrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                saleProfit = saleProfit.add(item.getLineTotal().subtract(cost));
            }
            saleProfit = saleProfit.subtract(sale.getDiscount());
            estimatedProfit = estimatedProfit.add(saleProfit);
        }
        estimatedProfit = estimatedProfit.setScale(2, RoundingMode.HALF_UP);

        long lowStockCount = productRepository.countLowStockProducts();

        List<SaleResponse> recentSales = saleRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(mapper::toSaleResponse)
                .collect(Collectors.toList());

        List<LowStockAlertDto> lowStockAlerts = alertService.getLowStockAlerts().stream()
                .limit(5)
                .collect(Collectors.toList());

        List<ExpiryAlertDto> expiryAlerts = alertService.getExpiryAlerts().stream()
                .limit(5)
                .collect(Collectors.toList());

        // Daily sales chart for last 7 days
        LocalDateTime sevenDaysAgo = LocalDate.now().minusDays(6).atStartOfDay();
        List<SalesChartDto> dailySales = reportService.getSalesReport(sevenDaysAgo, LocalDateTime.now(), "DAILY");

        // Monthly sales chart for last 6 months
        LocalDateTime sixMonthsAgo = LocalDate.now().minusMonths(5).withDayOfMonth(1).atStartOfDay();
        List<SalesChartDto> monthlySales = reportService.getSalesReport(sixMonthsAgo, LocalDateTime.now(), "MONTHLY");

        return DashboardSummaryResponse.builder()
                .totalProducts(totalProducts)
                .totalSales(totalSales)
                .totalRevenue(totalRevenue)
                .estimatedProfit(estimatedProfit)
                .lowStockCount(lowStockCount)
                .recentSales(recentSales)
                .lowStockAlerts(lowStockAlerts)
                .expiryAlerts(expiryAlerts)
                .dailySales(dailySales)
                .monthlySales(monthlySales)
                .build();
    }
}
