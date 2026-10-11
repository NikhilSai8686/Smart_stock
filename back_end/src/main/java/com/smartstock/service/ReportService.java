package com.smartstock.service;

import com.smartstock.dto.BestSellingProductDto;
import com.smartstock.dto.ProfitReportResponse;
import com.smartstock.dto.SalesChartDto;
import com.smartstock.dto.SlowMovingProductDto;

import java.time.LocalDateTime;
import java.util.List;

public interface ReportService {
    List<SalesChartDto> getSalesReport(LocalDateTime startDate, LocalDateTime endDate, String interval);
    ProfitReportResponse getProfitReport(LocalDateTime startDate, LocalDateTime endDate);
    List<BestSellingProductDto> getBestSellingProducts(int limit);
    List<SlowMovingProductDto> getSlowMovingProducts(int limit);
}
