package com.smartstock.service.impl;

import com.smartstock.dto.*;
import com.smartstock.entity.*;
import com.smartstock.exception.BadRequestException;
import com.smartstock.exception.ResourceNotFoundException;
import com.smartstock.mapper.EntityMapper;
import com.smartstock.repository.ProductRepository;
import com.smartstock.repository.PurchaseRepository;
import com.smartstock.repository.StockMovementRepository;
import com.smartstock.repository.SupplierRepository;
import com.smartstock.service.PurchaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseServiceImpl implements PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final StockMovementRepository stockMovementRepository;
    private final EntityMapper mapper;

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PurchaseResponse createPurchase(PurchaseRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Purchase must contain at least one product item.");
        }

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + request.getSupplierId()));
        }

        String invoiceNumber = "PO-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmmss"))
                + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Purchase purchase = Purchase.builder()
                .supplier(supplier)
                .invoiceNumber(invoiceNumber)
                .build();

        BigDecimal totalCost = BigDecimal.ZERO;

        for (PurchaseItemRequest itemReq : request.getItems()) {
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new BadRequestException("Quantity must be greater than zero.");
            }

            // Pessimistic write lock for atomic inventory update
            Product product = productRepository.findByIdWithLock(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + itemReq.getProductId()));

            // Increase product stock
            product.setQuantity(product.getQuantity() + itemReq.getQuantity());

            // Update product purchase price to latest unit cost
            if (itemReq.getUnitPurchasePrice() != null) {
                product.setPurchasePrice(itemReq.getUnitPurchasePrice());
            }

            // If product didn't have a supplier and purchase specifies one, associate it
            if (product.getSupplier() == null && supplier != null) {
                product.setSupplier(supplier);
            }

            productRepository.save(product);

            BigDecimal lineTotal = itemReq.getUnitPurchasePrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalCost = totalCost.add(lineTotal);

            PurchaseItem purchaseItem = PurchaseItem.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPurchasePrice(itemReq.getUnitPurchasePrice())
                    .lineTotal(lineTotal)
                    .build();

            purchase.addItem(purchaseItem);

            // Audit record for stock movement
            StockMovement movement = StockMovement.builder()
                    .product(product)
                    .movementType(MovementType.PURCHASE)
                    .quantityChanged(itemReq.getQuantity())
                    .referenceId(invoiceNumber)
                    .build();
            stockMovementRepository.save(movement);
        }

        purchase.setTotalCost(totalCost);
        Purchase savedPurchase = purchaseRepository.save(purchase);
        return mapper.toPurchaseResponse(savedPurchase);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PurchaseResponse> getPurchases(int page, int size, LocalDateTime startDate, LocalDateTime endDate) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Purchase> purchasePage = purchaseRepository.findWithDateFilters(startDate, endDate, pageable);

        List<PurchaseResponse> content = purchasePage.getContent().stream()
                .map(mapper::toPurchaseResponse)
                .collect(Collectors.toList());

        return PageResponse.<PurchaseResponse>builder()
                .content(content)
                .pageNumber(purchasePage.getNumber())
                .pageSize(purchasePage.getSize())
                .totalElements(purchasePage.getTotalElements())
                .totalPages(purchasePage.getTotalPages())
                .last(purchasePage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseResponse getPurchaseById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with ID: " + id));
        return mapper.toPurchaseResponse(purchase);
    }
}
