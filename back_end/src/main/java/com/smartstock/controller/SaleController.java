package com.smartstock.controller;

import com.smartstock.dto.*;
import com.smartstock.security.UserPrincipal;
import com.smartstock.service.SaleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
@Tag(name = "Sales", description = "Point-of-Sale checkout, invoicing, and sales history endpoints")
public class SaleController {

    private final SaleService saleService;

    @PostMapping
    @Operation(summary = "Complete a sale, decrement inventory, record stock audit, and generate invoice")
    public ResponseEntity<ApiResponse<SaleResponse>> createSale(
            @Valid @RequestBody SaleRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        SaleResponse sale = saleService.createSale(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Sale completed successfully", sale));
    }

    @GetMapping
    @Operation(summary = "Get paginated sales with optional date filtering")
    public ResponseEntity<ApiResponse<PageResponse<SaleResponse>>> getSales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        PageResponse<SaleResponse> sales = saleService.getSales(page, size, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(sales));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get sale details by ID")
    public ResponseEntity<ApiResponse<SaleResponse>> getSaleById(@PathVariable Long id) {
        SaleResponse sale = saleService.getSaleById(id);
        return ResponseEntity.ok(ApiResponse.success(sale));
    }

    @GetMapping("/invoice/{invoiceNumber}")
    @Operation(summary = "Get sale details by invoice number")
    public ResponseEntity<ApiResponse<SaleResponse>> getSaleByInvoiceNumber(@PathVariable String invoiceNumber) {
        SaleResponse sale = saleService.getSaleByInvoiceNumber(invoiceNumber);
        return ResponseEntity.ok(ApiResponse.success(sale));
    }
}
