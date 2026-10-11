package com.smartstock.service;

import com.smartstock.dto.PageResponse;
import com.smartstock.dto.SupplierRequest;
import com.smartstock.dto.SupplierResponse;

import java.util.List;

public interface SupplierService {
    List<SupplierResponse> getAllSuppliers();
    PageResponse<SupplierResponse> getSuppliers(int page, int size, String search);
    SupplierResponse getSupplierById(Long id);
    SupplierResponse createSupplier(SupplierRequest request);
    SupplierResponse updateSupplier(Long id, SupplierRequest request);
    void deleteSupplier(Long id);
}
