package com.smartstock.service.impl;

import com.smartstock.dto.BestSellingProductDto;
import com.smartstock.dto.ProfitReportResponse;
import com.smartstock.dto.SalesChartDto;
import com.smartstock.dto.SlowMovingProductDto;
import com.smartstock.entity.Product;
import com.smartstock.entity.Sale;
import com.smartstock.entity.SaleItem;
import com.smartstock.repository.ProductRepository;
import com.smartstock.repository.SaleItemRepository;
import com.smartstock.repository.SaleRepository;
import com.smartstock.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SalesChartDto> getSalesReport(LocalDateTime startDate, LocalDateTime endDate, String interval) {
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30).atStartOfDay();
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        List<Sale> sales = saleRepository.findSalesBetween(startDate, endDate);

        DateTimeFormatter formatter;
        if ("MONTHLY".equalsIgnoreCase(interval)) {
            formatter = DateTimeFormatter.ofPattern("MMM yyyy");
        } else {
            formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        }

        Map<String, List<Sale>> groupedSales = new LinkedHashMap<>();
        for (Sale sale : sales) {
            String key = sale.getCreatedAt().format(formatter);
            groupedSales.computeIfAbsent(key, k -> new ArrayList<>()).add(sale);
        }

        List<SalesChartDto> result = new ArrayList<>();
        for (Map.Entry<String, List<Sale>> entry : groupedSales.entrySet()) {
            String label = entry.getKey();
            List<Sale> periodSales = entry.getValue();

            BigDecimal revenue = BigDecimal.ZERO;
            BigDecimal profit = BigDecimal.ZERO;

            for (Sale sale : periodSales) {
                revenue = revenue.add(sale.getGrandTotal());

                BigDecimal saleItemsProfit = BigDecimal.ZERO;
                for (SaleItem item : sale.getItems()) {
                    BigDecimal itemCost = item.getUnitPurchasePrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    BigDecimal itemProfit = item.getLineTotal().subtract(itemCost);
                    saleItemsProfit = saleItemsProfit.add(itemProfit);
                }
                saleItemsProfit = saleItemsProfit.subtract(sale.getDiscount());
                profit = profit.add(saleItemsProfit);
            }

            result.add(SalesChartDto.builder()
                    .label(label)
                    .salesCount(periodSales.size())
                    .revenue(revenue.setScale(2, RoundingMode.HALF_UP))
                    .profit(profit.setScale(2, RoundingMode.HALF_UP))
                    .build());
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public ProfitReportResponse getProfitReport(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30).atStartOfDay();
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        List<Sale> sales = saleRepository.findSalesBetween(startDate, endDate);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;
        BigDecimal grossProfit = BigDecimal.ZERO;

        for (Sale sale : sales) {
            totalRevenue = totalRevenue.add(sale.getGrandTotal());

            BigDecimal saleProfit = BigDecimal.ZERO;
            for (SaleItem item : sale.getItems()) {
                BigDecimal itemCost = item.getUnitPurchasePrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                totalCost = totalCost.add(itemCost);
                saleProfit = saleProfit.add(item.getLineTotal().subtract(itemCost));
            }
            saleProfit = saleProfit.subtract(sale.getDiscount());
            grossProfit = grossProfit.add(saleProfit);
        }

        BigDecimal margin = BigDecimal.ZERO;
        if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
            margin = grossProfit.multiply(BigDecimal.valueOf(100))
                    .divide(totalRevenue, 2, RoundingMode.HALF_UP);
        }

        List<SalesChartDto> breakdown = getSalesReport(startDate, endDate, "DAILY");

        return ProfitReportResponse.builder()
                .totalRevenue(totalRevenue.setScale(2, RoundingMode.HALF_UP))
                .totalCost(totalCost.setScale(2, RoundingMode.HALF_UP))
                .grossProfit(grossProfit.setScale(2, RoundingMode.HALF_UP))
                .profitMarginPercentage(margin)
                .breakdown(breakdown)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BestSellingProductDto> getBestSellingProducts(int limit) {
        List<Object[]> rawList = saleItemRepository.findBestSellingProducts(PageRequest.of(0, limit));
        return rawList.stream().map(row -> BestSellingProductDto.builder()
                .productId(((Number) row[0]).longValue())
                .productName((String) row[1])
                .sku((String) row[2])
                .totalQuantitySold(((Number) row[3]).longValue())
                .totalRevenue(row[4] != null ? new BigDecimal(row[4].toString()).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO)
                .build()
        ).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SlowMovingProductDto> getSlowMovingProducts(int limit) {
        List<Product> allProducts = productRepository.findAll();
        // Compute sold quantities
        List<SaleItem> allItems = saleItemRepository.findAll();
        Map<Long, Long> productSalesMap = new HashMap<>();
        for (SaleItem item : allItems) {
            Long pId = item.getProduct().getId();
            productSalesMap.put(pId, productSalesMap.getOrDefault(pId, 0L) + item.getQuantity());
        }

        List<SlowMovingProductDto> list = allProducts.stream()
                .map(p -> SlowMovingProductDto.builder()
                        .productId(p.getId())
                        .productName(p.getName())
                        .sku(p.getSku())
                        .currentStock(p.getQuantity())
                        .totalQuantitySold(productSalesMap.getOrDefault(p.getId(), 0L))
                        .sellingPrice(p.getSellingPrice())
                        .build())
                .sorted(Comparator.comparingLong(SlowMovingProductDto::getTotalQuantitySold)
                        .thenComparing(Comparator.comparingInt(SlowMovingProductDto::getCurrentStock).reversed()))
                .limit(limit)
                .collect(Collectors.toList());

        return list;
    }
}
