package com.smartstock.controller;

import com.smartstock.dto.*;
import com.smartstock.service.PurchaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
@Tag(name = "Purchases", description = "Purchase orders and incoming inventory replenishment")
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping
    @Operation(summary = "Record purchase order, increment inventory, update purchase cost, and record stock movement")
    public ResponseEntity<ApiResponse<PurchaseResponse>> createPurchase(@Valid @RequestBody PurchaseRequest request) {
        PurchaseResponse purchase = purchaseService.createPurchase(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Purchase recorded successfully", purchase));
    }

    @GetMapping
    @Operation(summary = "Get paginated purchase orders with optional date filter")
    public ResponseEntity<ApiResponse<PageResponse<PurchaseResponse>>> getPurchases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        PageResponse<PurchaseResponse> purchases = purchaseService.getPurchases(page, size, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(purchases));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get purchase details by ID")
    public ResponseEntity<ApiResponse<PurchaseResponse>> getPurchaseById(@PathVariable Long id) {
        PurchaseResponse purchase = purchaseService.getPurchaseById(id);
        return ResponseEntity.ok(ApiResponse.success(purchase));
    }
}
