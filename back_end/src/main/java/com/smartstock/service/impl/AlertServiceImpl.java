package com.smartstock.service.impl;

import com.smartstock.dto.ExpiryAlertDto;
import com.smartstock.dto.LowStockAlertDto;
import com.smartstock.entity.Product;
import com.smartstock.mapper.EntityMapper;
import com.smartstock.repository.ProductRepository;
import com.smartstock.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertServiceImpl implements AlertService {

    private final ProductRepository productRepository;
    private final EntityMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<LowStockAlertDto> getLowStockAlerts() {
        List<Product> products = productRepository.findLowStockProducts();
        return products.stream()
                .map(mapper::toLowStockAlertDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpiryAlertDto> getExpiryAlerts() {
        // Find products expired or expiring in the next 30 days
        LocalDate threshold = LocalDate.now().plusDays(30);
        List<Product> products = productRepository.findExpiringProducts(threshold);

        return products.stream()
                .map(mapper::toExpiryAlertDto)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}
