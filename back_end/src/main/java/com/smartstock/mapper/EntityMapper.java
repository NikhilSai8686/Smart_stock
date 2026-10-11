package com.smartstock.mapper;

import com.smartstock.dto.*;
import com.smartstock.entity.*;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;

@Component
public class EntityMapper {

    public UserDto toUserDto(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .enabled(user.getEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public SupplierResponse toSupplierResponse(Supplier supplier) {
        if (supplier == null) return null;
        return SupplierResponse.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .phone(supplier.getPhone())
                .email(supplier.getEmail())
                .address(supplier.getAddress())
                .createdAt(supplier.getCreatedAt())
                .build();
    }

    public ProductResponse toProductResponse(Product product) {
        if (product == null) return null;

        String stockStatus;
        if (product.getQuantity() == null || product.getQuantity() <= 0) {
            stockStatus = "OUT_OF_STOCK";
        } else if (product.getQuantity() <= product.getMinimumStockLevel()) {
            stockStatus = "LOW_STOCK";
        } else {
            stockStatus = "IN_STOCK";
        }

        LocalDate now = LocalDate.now();
        boolean isExpired = product.getExpiryDate() != null && product.getExpiryDate().isBefore(now);
        boolean isLowStock = product.getQuantity() != null && product.getQuantity() <= product.getMinimumStockLevel();

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .category(product.getCategory())
                .purchasePrice(product.getPurchasePrice())
                .sellingPrice(product.getSellingPrice())
                .quantity(product.getQuantity())
                .minimumStockLevel(product.getMinimumStockLevel())
                .expiryDate(product.getExpiryDate())
                .supplierId(product.getSupplier() != null ? product.getSupplier().getId() : null)
                .supplierName(product.getSupplier() != null ? product.getSupplier().getName() : null)
                .stockStatus(stockStatus)
                .isExpired(isExpired)
                .isLowStock(isLowStock)
                .createdAt(product.getCreatedAt())
                .build();
    }

    public SaleItemResponse toSaleItemResponse(SaleItem item) {
        if (item == null) return null;
        return SaleItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProduct() != null ? item.getProduct().getName() : null)
                .productSku(item.getProduct() != null ? item.getProduct().getSku() : null)
                .quantity(item.getQuantity())
                .unitSellingPrice(item.getUnitSellingPrice())
                .unitPurchasePrice(item.getUnitPurchasePrice())
                .lineTotal(item.getLineTotal())
                .build();
    }

    public SaleResponse toSaleResponse(Sale sale) {
        if (sale == null) return null;
        return SaleResponse.builder()
                .id(sale.getId())
                .invoiceNumber(sale.getInvoiceNumber())
                .userId(sale.getUser() != null ? sale.getUser().getId() : null)
                .cashierName(sale.getUser() != null ? sale.getUser().getFullName() : "System")
                .subtotal(sale.getSubtotal())
                .discount(sale.getDiscount())
                .tax(sale.getTax())
                .grandTotal(sale.getGrandTotal())
                .items(sale.getItems() != null ? sale.getItems().stream().map(this::toSaleItemResponse).collect(Collectors.toList()) : null)
                .createdAt(sale.getCreatedAt())
                .build();
    }

    public PurchaseItemResponse toPurchaseItemResponse(PurchaseItem item) {
        if (item == null) return null;
        return PurchaseItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProduct() != null ? item.getProduct().getName() : null)
                .productSku(item.getProduct() != null ? item.getProduct().getSku() : null)
                .quantity(item.getQuantity())
                .unitPurchasePrice(item.getUnitPurchasePrice())
                .lineTotal(item.getLineTotal())
                .build();
    }

    public PurchaseResponse toPurchaseResponse(Purchase purchase) {
        if (purchase == null) return null;
        return PurchaseResponse.builder()
                .id(purchase.getId())
                .invoiceNumber(purchase.getInvoiceNumber())
                .supplierId(purchase.getSupplier() != null ? purchase.getSupplier().getId() : null)
                .supplierName(purchase.getSupplier() != null ? purchase.getSupplier().getName() : "Unknown Supplier")
                .totalCost(purchase.getTotalCost())
                .items(purchase.getItems() != null ? purchase.getItems().stream().map(this::toPurchaseItemResponse).collect(Collectors.toList()) : null)
                .createdAt(purchase.getCreatedAt())
                .build();
    }

    public LowStockAlertDto toLowStockAlertDto(Product product) {
        if (product == null) return null;
        String status = product.getQuantity() == 0 ? "OUT_OF_STOCK" :
                (product.getQuantity() <= (product.getMinimumStockLevel() / 2) ? "CRITICAL" : "LOW");
        return LowStockAlertDto.builder()
                .productId(product.getId())
                .productName(product.getName())
                .sku(product.getSku())
                .category(product.getCategory())
                .currentStock(product.getQuantity())
                .minimumStockLevel(product.getMinimumStockLevel())
                .status(status)
                .build();
    }

    public ExpiryAlertDto toExpiryAlertDto(Product product) {
        if (product == null || product.getExpiryDate() == null) return null;
        LocalDate now = LocalDate.now();
        long daysRemaining = ChronoUnit.DAYS.between(now, product.getExpiryDate());
        String status = daysRemaining < 0 ? "EXPIRED" : "EXPIRING_SOON";

        return ExpiryAlertDto.builder()
                .productId(product.getId())
                .productName(product.getName())
                .sku(product.getSku())
                .category(product.getCategory())
                .currentStock(product.getQuantity())
                .expiryDate(product.getExpiryDate())
                .daysRemaining(daysRemaining)
                .status(status)
                .build();
    }
}
