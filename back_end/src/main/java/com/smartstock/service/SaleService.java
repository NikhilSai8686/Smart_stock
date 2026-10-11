package com.smartstock.service;

import com.smartstock.dto.PageResponse;
import com.smartstock.dto.SaleRequest;
import com.smartstock.dto.SaleResponse;
import com.smartstock.security.UserPrincipal;

import java.time.LocalDateTime;

public interface SaleService {
    SaleResponse createSale(SaleRequest request, UserPrincipal currentUser);
    PageResponse<SaleResponse> getSales(int page, int size, LocalDateTime startDate, LocalDateTime endDate);
    SaleResponse getSaleById(Long id);
    SaleResponse getSaleByInvoiceNumber(String invoiceNumber);
}
