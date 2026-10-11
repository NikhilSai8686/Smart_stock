package com.smartstock.util;

import com.smartstock.entity.*;
import com.smartstock.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final PurchaseRepository purchaseRepository;
    private final StockMovementRepository stockMovementRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already contains data, skipping initialization.");
            return;
        }

        log.info("Initializing SmartStock seed data...");

        // 1. Users
        User admin = User.builder()
                .fullName("Sarah Jenkins (Admin)")
                .email("admin@smartstock.com")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .enabled(true)
                .build();

        User staff = User.builder()
                .fullName("Alex Rivera (Staff)")
                .email("staff@smartstock.com")
                .passwordHash(passwordEncoder.encode("staff123"))
                .role(Role.STAFF)
                .enabled(true)
                .build();

        userRepository.saveAll(List.of(admin, staff));

        // 2. Suppliers
        Supplier s1 = Supplier.builder()
                .name("Apex Wholesale Foods")
                .phone("+1 555-019-2831")
                .email("orders@apexfoods.com")
                .address("450 Logistics Parkway, Suite 100, Chicago, IL")
                .build();

        Supplier s2 = Supplier.builder()
                .name("Metro Stationery & Office Supplies")
                .phone("+1 555-014-9923")
                .email("sales@metrostationery.com")
                .address("88 Commerce St, Dallas, TX")
                .build();

        Supplier s3 = Supplier.builder()
                .name("Urban Style Apparel Co.")
                .phone("+1 555-017-3344")
                .email("contact@urbanstyleapparel.com")
                .address("120 Fashion Blvd, Los Angeles, CA")
                .build();

        Supplier s4 = Supplier.builder()
                .name("GreenValley Organic Producers")
                .phone("+1 555-012-7819")
                .email("info@greenvalleyorganic.com")
                .address("14 Rural Route 5, Madison, WI")
                .build();

        supplierRepository.saveAll(List.of(s1, s2, s3, s4));

        // 3. Products
        LocalDate today = LocalDate.now();

        Product p1 = Product.builder()
                .name("Organic Whole Milk 1 Gallon")
                .sku("GROC-MLK-001")
                .category("Grocery")
                .purchasePrice(new BigDecimal("3.20"))
                .sellingPrice(new BigDecimal("4.99"))
                .quantity(18)
                .minimumStockLevel(10)
                .expiryDate(today.plusDays(4)) // Expiring soon
                .supplier(s4)
                .build();

        Product p2 = Product.builder()
                .name("Basmati Rice Premium 10lb")
                .sku("GROC-RIC-002")
                .category("Grocery")
                .purchasePrice(new BigDecimal("12.50"))
                .sellingPrice(new BigDecimal("18.99"))
                .quantity(35)
                .minimumStockLevel(8)
                .expiryDate(today.plusMonths(12))
                .supplier(s1)
                .build();

        Product p3 = Product.builder()
                .name("Extra Virgin Olive Oil 750ml")
                .sku("GROC-OIL-003")
                .category("Grocery")
                .purchasePrice(new BigDecimal("8.00"))
                .sellingPrice(new BigDecimal("13.49"))
                .quantity(3) // Low stock!
                .minimumStockLevel(6)
                .expiryDate(today.plusMonths(8))
                .supplier(s1)
                .build();

        Product p4 = Product.builder()
                .name("Dark Roast Coffee Beans 1kg")
                .sku("BEV-COF-001")
                .category("Beverages")
                .purchasePrice(new BigDecimal("11.00"))
                .sellingPrice(new BigDecimal("17.50"))
                .quantity(22)
                .minimumStockLevel(5)
                .expiryDate(today.plusMonths(6))
                .supplier(s4)
                .build();

        Product p5 = Product.builder()
                .name("Sparkling Natural Mineral Water 12-pack")
                .sku("BEV-WTR-002")
                .category("Beverages")
                .purchasePrice(new BigDecimal("5.50"))
                .sellingPrice(new BigDecimal("8.99"))
                .quantity(0) // Out of stock!
                .minimumStockLevel(5)
                .expiryDate(today.plusMonths(9))
                .supplier(s1)
                .build();

        Product p6 = Product.builder()
                .name("Classic Cotton Crew T-Shirt (Black - L)")
                .sku("APP-TSH-001")
                .category("Clothing")
                .purchasePrice(new BigDecimal("7.50"))
                .sellingPrice(new BigDecimal("19.99"))
                .quantity(40)
                .minimumStockLevel(10)
                .expiryDate(null)
                .supplier(s3)
                .build();

        Product p7 = Product.builder()
                .name("Stretch Denim Jeans 32x32")
                .sku("APP-JNS-002")
                .category("Clothing")
                .purchasePrice(new BigDecimal("18.00"))
                .sellingPrice(new BigDecimal("44.99"))
                .quantity(4) // Low stock!
                .minimumStockLevel(8)
                .expiryDate(null)
                .supplier(s3)
                .build();

        Product p8 = Product.builder()
                .name("College Ruled Spiral Notebook 3-Subject")
                .sku("STAT-NOT-001")
                .category("Stationery")
                .purchasePrice(new BigDecimal("2.10"))
                .sellingPrice(new BigDecimal("4.50"))
                .quantity(65)
                .minimumStockLevel(15)
                .expiryDate(null)
                .supplier(s2)
                .build();

        Product p9 = Product.builder()
                .name("Gel Ink Pens 0.7mm Black (Pack of 10)")
                .sku("STAT-PEN-002")
                .category("Stationery")
                .purchasePrice(new BigDecimal("4.20"))
                .sellingPrice(new BigDecimal("8.49"))
                .quantity(2) // Low stock!
                .minimumStockLevel(10)
                .expiryDate(null)
                .supplier(s2)
                .build();

        Product p10 = Product.builder()
                .name("Artisan Sea Salt Crackers 200g")
                .sku("SNCK-CRK-001")
                .category("Snacks")
                .purchasePrice(new BigDecimal("1.80"))
                .sellingPrice(new BigDecimal("3.29"))
                .quantity(12)
                .minimumStockLevel(10)
                .expiryDate(today.minusDays(2)) // Already expired!
                .supplier(s1)
                .build();

        productRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10));

        // 4. Sample Purchases
        Purchase po1 = Purchase.builder()
                .supplier(s1)
                .invoiceNumber("PO-20261001-A101")
                .totalCost(new BigDecimal("845.00"))
                .createdAt(LocalDateTime.now().minusDays(10))
                .build();

        PurchaseItem poi1 = PurchaseItem.builder()
                .product(p2)
                .quantity(40)
                .unitPurchasePrice(new BigDecimal("12.50"))
                .lineTotal(new BigDecimal("500.00"))
                .build();
        po1.addItem(poi1);

        PurchaseItem poi2 = PurchaseItem.builder()
                .product(p3)
                .quantity(20)
                .unitPurchasePrice(new BigDecimal("8.00"))
                .lineTotal(new BigDecimal("160.00"))
                .build();
        po1.addItem(poi2);
        purchaseRepository.save(po1);

        // 5. Sample Sales
        Sale sale1 = Sale.builder()
                .invoiceNumber("INV-20261008-001")
                .user(staff)
                .subtotal(new BigDecimal("67.97"))
                .discount(BigDecimal.ZERO)
                .tax(new BigDecimal("5.44"))
                .grandTotal(new BigDecimal("73.41"))
                .createdAt(LocalDateTime.now().minusDays(3))
                .build();

        SaleItem si1 = SaleItem.builder()
                .product(p2)
                .quantity(2)
                .unitSellingPrice(new BigDecimal("18.99"))
                .unitPurchasePrice(new BigDecimal("12.50"))
                .lineTotal(new BigDecimal("37.98"))
                .build();
        sale1.addItem(si1);

        SaleItem si2 = SaleItem.builder()
                .product(p1)
                .quantity(6)
                .unitSellingPrice(new BigDecimal("4.99"))
                .unitPurchasePrice(new BigDecimal("3.20"))
                .lineTotal(new BigDecimal("29.94"))
                .build();
        sale1.addItem(si2);
        saleRepository.save(sale1);

        Sale sale2 = Sale.builder()
                .invoiceNumber("INV-20261010-002")
                .user(admin)
                .subtotal(new BigDecimal("89.98"))
                .discount(new BigDecimal("5.00"))
                .tax(new BigDecimal("6.80"))
                .grandTotal(new BigDecimal("91.78"))
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        SaleItem si3 = SaleItem.builder()
                .product(p7)
                .quantity(2)
                .unitSellingPrice(new BigDecimal("44.99"))
                .unitPurchasePrice(new BigDecimal("18.00"))
                .lineTotal(new BigDecimal("89.98"))
                .build();
        sale2.addItem(si3);
        saleRepository.save(sale2);

        Sale sale3 = Sale.builder()
                .invoiceNumber("INV-20261011-003")
                .user(staff)
                .subtotal(new BigDecimal("39.98"))
                .discount(BigDecimal.ZERO)
                .tax(new BigDecimal("3.20"))
                .grandTotal(new BigDecimal("43.18"))
                .createdAt(LocalDateTime.now().minusHours(4))
                .build();

        SaleItem si4 = SaleItem.builder()
                .product(p6)
                .quantity(2)
                .unitSellingPrice(new BigDecimal("19.99"))
                .unitPurchasePrice(new BigDecimal("7.50"))
                .lineTotal(new BigDecimal("39.98"))
                .build();
        sale3.addItem(si4);
        saleRepository.save(sale3);

        // Record stock movements
        stockMovementRepository.save(StockMovement.builder()
                .product(p2)
                .movementType(MovementType.PURCHASE)
                .quantityChanged(40)
                .referenceId("PO-20261001-A101")
                .build());

        stockMovementRepository.save(StockMovement.builder()
                .product(p2)
                .movementType(MovementType.SALE)
                .quantityChanged(-2)
                .referenceId("INV-20261008-001")
                .build());

        log.info("SmartStock seed data initialized successfully! Admin: admin@smartstock.com / admin123");
    }
}
