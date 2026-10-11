package com.smartstock.service;

import com.smartstock.dto.PageResponse;
import com.smartstock.dto.PurchaseRequest;
import com.smartstock.dto.PurchaseResponse;

import java.time.LocalDateTime;

public interface PurchaseService {
    PurchaseResponse createPurchase(PurchaseRequest request);
    PageResponse<PurchaseResponse> getPurchases(int page, int size, LocalDateTime startDate, LocalDateTime endDate);
    PurchaseResponse getPurchaseById(Long id);
}
