package com.smartstock.service.impl;

import com.smartstock.dto.*;
import com.smartstock.entity.*;
import com.smartstock.exception.BadRequestException;
import com.smartstock.exception.InsufficientStockException;
import com.smartstock.exception.ResourceNotFoundException;
import com.smartstock.mapper.EntityMapper;
import com.smartstock.repository.ProductRepository;
import com.smartstock.repository.SaleRepository;
import com.smartstock.repository.StockMovementRepository;
import com.smartstock.repository.UserRepository;
import com.smartstock.security.UserPrincipal;
import com.smartstock.service.SaleService;
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
public class SaleServiceImpl implements SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;
    private final UserRepository userRepository;
    private final EntityMapper mapper;

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public SaleResponse createSale(SaleRequest request, UserPrincipal currentUser) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Sale must contain at least one item.");
        }

        User user = null;
        if (currentUser != null && currentUser.getId() != null) {
            user = userRepository.findById(currentUser.getId()).orElse(null);
        }

        String invoiceNumber = "INV-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmmss"))
                + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Sale sale = Sale.builder()
                .invoiceNumber(invoiceNumber)
                .user(user)
                .discount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO)
                .tax(request.getTax() != null ? request.getTax() : BigDecimal.ZERO)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (SaleItemRequest itemReq : request.getItems()) {
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new BadRequestException("Quantity must be greater than zero.");
            }

            // Pessimistic write lock on product to coordinate concurrent stock updates
            Product product = productRepository.findByIdWithLock(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + itemReq.getProductId()));

            if (product.getQuantity() < itemReq.getQuantity()) {
                throw new InsufficientStockException(product.getName(), product.getQuantity(), itemReq.getQuantity());
            }

            // Decrement inventory
            product.setQuantity(product.getQuantity() - itemReq.getQuantity());
            productRepository.save(product);

            BigDecimal lineTotal = product.getSellingPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            // Save actual historical unit purchase cost on SaleItem
            SaleItem saleItem = SaleItem.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitSellingPrice(product.getSellingPrice())
                    .unitPurchasePrice(product.getPurchasePrice())
                    .lineTotal(lineTotal)
                    .build();

            sale.addItem(saleItem);

            // Record stock audit movement
            StockMovement movement = StockMovement.builder()
                    .product(product)
                    .movementType(MovementType.SALE)
                    .quantityChanged(-itemReq.getQuantity())
                    .referenceId(invoiceNumber)
                    .build();
            stockMovementRepository.save(movement);
        }

        sale.setSubtotal(subtotal);

        BigDecimal discount = sale.getDiscount();
        BigDecimal tax = sale.getTax();
        BigDecimal grandTotal = subtotal.subtract(discount).add(tax);
        if (grandTotal.compareTo(BigDecimal.ZERO) < 0) {
            grandTotal = BigDecimal.ZERO;
        }
        sale.setGrandTotal(grandTotal);

        Sale savedSale = saleRepository.save(sale);
        return mapper.toSaleResponse(savedSale);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SaleResponse> getSales(int page, int size, LocalDateTime startDate, LocalDateTime endDate) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Sale> salePage = saleRepository.findWithDateFilters(startDate, endDate, pageable);

        List<SaleResponse> content = salePage.getContent().stream()
                .map(mapper::toSaleResponse)
                .collect(Collectors.toList());

        return PageResponse.<SaleResponse>builder()
                .content(content)
                .pageNumber(salePage.getNumber())
                .pageSize(salePage.getSize())
                .totalElements(salePage.getTotalElements())
                .totalPages(salePage.getTotalPages())
                .last(salePage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SaleResponse getSaleById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with ID: " + id));
        return mapper.toSaleResponse(sale);
    }

    @Override
    @Transactional(readOnly = true)
    public SaleResponse getSaleByInvoiceNumber(String invoiceNumber) {
        Sale sale = saleRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with invoice: " + invoiceNumber));
        return mapper.toSaleResponse(sale);
    }
}
