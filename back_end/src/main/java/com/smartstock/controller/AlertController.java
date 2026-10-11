package com.smartstock.controller;

import com.smartstock.dto.ApiResponse;
import com.smartstock.dto.ExpiryAlertDto;
import com.smartstock.dto.LowStockAlertDto;
import com.smartstock.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@Tag(name = "Alerts", description = "Low-stock warning and product expiry alert endpoints")
public class AlertController {

    private final AlertService alertService;

    @GetMapping("/low-stock")
    @Operation(summary = "Get list of all products running at or below minimum threshold")
    public ResponseEntity<ApiResponse<List<LowStockAlertDto>>> getLowStockAlerts() {
        List<LowStockAlertDto> alerts = alertService.getLowStockAlerts();
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/expiry")
    @Operation(summary = "Get list of products nearing expiration date or already expired")
    public ResponseEntity<ApiResponse<List<ExpiryAlertDto>>> getExpiryAlerts() {
        List<ExpiryAlertDto> alerts = alertService.getExpiryAlerts();
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }
}
