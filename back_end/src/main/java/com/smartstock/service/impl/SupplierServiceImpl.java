package com.smartstock.service.impl;

import com.smartstock.dto.PageResponse;
import com.smartstock.dto.SupplierRequest;
import com.smartstock.dto.SupplierResponse;
import com.smartstock.entity.Supplier;
import com.smartstock.exception.ResourceNotFoundException;
import com.smartstock.mapper.EntityMapper;
import com.smartstock.repository.SupplierRepository;
import com.smartstock.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final EntityMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAllByOrderByNameAsc().stream()
                .map(mapper::toSupplierResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SupplierResponse> getSuppliers(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Supplier> supplierPage;

        if (StringUtils.hasText(search)) {
            supplierPage = supplierRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, pageable);
        } else {
            supplierPage = supplierRepository.findAll(pageable);
        }

        List<SupplierResponse> content = supplierPage.getContent().stream()
                .map(mapper::toSupplierResponse)
                .collect(Collectors.toList());

        return PageResponse.<SupplierResponse>builder()
                .content(content)
                .pageNumber(supplierPage.getNumber())
                .pageSize(supplierPage.getSize())
                .totalElements(supplierPage.getTotalElements())
                .totalPages(supplierPage.getTotalPages())
                .last(supplierPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + id));
        return mapper.toSupplierResponse(supplier);
    }

    @Override
    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        Supplier supplier = Supplier.builder()
                .name(request.getName().trim())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .email(request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null)
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .build();

        Supplier saved = supplierRepository.save(supplier);
        return mapper.toSupplierResponse(saved);
    }

    @Override
    @Transactional
    public SupplierResponse updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + id));

        supplier.setName(request.getName().trim());
        supplier.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        supplier.setEmail(request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null);
        supplier.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);

        Supplier updated = supplierRepository.save(supplier);
        return mapper.toSupplierResponse(updated);
    }

    @Override
    @Transactional
    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Supplier not found with ID: " + id);
        }
        supplierRepository.deleteById(id);
    }
}
