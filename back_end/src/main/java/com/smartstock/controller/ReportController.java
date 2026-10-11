package com.smartstock.controller;

import com.smartstock.dto.*;
import com.smartstock.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Analytical reports for sales, gross profits, and product velocity")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/sales")
    @Operation(summary = "Get daily, weekly, or monthly sales aggregations")
    public ResponseEntity<ApiResponse<List<SalesChartDto>>> getSalesReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "DAILY") String interval) {
        List<SalesChartDto> report = reportService.getSalesReport(startDate, endDate, interval);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/profit")
    @Operation(summary = "Get revenue, total purchase cost, gross profit, and margin percentages")
    public ResponseEntity<ApiResponse<ProfitReportResponse>> getProfitReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        ProfitReportResponse report = reportService.getProfitReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/best-selling-products")
    @Operation(summary = "Get top-selling products by quantity and revenue")
    public ResponseEntity<ApiResponse<List<BestSellingProductDto>>> getBestSellingProducts(
            @RequestParam(defaultValue = "5") int limit) {
        List<BestSellingProductDto> list = reportService.getBestSellingProducts(limit);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/slow-moving-products")
    @Operation(summary = "Get slow moving products with high inventory and low sales")
    public ResponseEntity<ApiResponse<List<SlowMovingProductDto>>> getSlowMovingProducts(
            @RequestParam(defaultValue = "5") int limit) {
        List<SlowMovingProductDto> list = reportService.getSlowMovingProducts(limit);
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
