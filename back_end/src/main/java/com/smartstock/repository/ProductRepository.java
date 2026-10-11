package com.smartstock.repository;

import com.smartstock.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(@Param("id") Long id);

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);

    @Query("SELECT p FROM Product p WHERE " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:category IS NULL OR LOWER(p.category) = LOWER(:category)) AND " +
           "(:stockStatus IS NULL OR " +
           "  (:stockStatus = 'OUT_OF_STOCK' AND p.quantity = 0) OR " +
           "  (:stockStatus = 'LOW_STOCK' AND p.quantity > 0 AND p.quantity <= p.minimumStockLevel) OR " +
           "  (:stockStatus = 'IN_STOCK' AND p.quantity > p.minimumStockLevel))")
    Page<Product> findWithFilters(
            @Param("search") String search,
            @Param("category") String category,
            @Param("stockStatus") String stockStatus,
            Pageable pageable
    );

    @Query("SELECT p FROM Product p WHERE p.quantity <= p.minimumStockLevel ORDER BY p.quantity ASC")
    List<Product> findLowStockProducts();

    @Query("SELECT p FROM Product p WHERE p.expiryDate IS NOT NULL AND p.expiryDate <= :thresholdDate ORDER BY p.expiryDate ASC")
    List<Product> findExpiringProducts(@Param("thresholdDate") LocalDate thresholdDate);

    @Query("SELECT p FROM Product p WHERE p.expiryDate IS NOT NULL AND p.expiryDate < :currentDate ORDER BY p.expiryDate ASC")
    List<Product> findExpiredProducts(@Param("currentDate") LocalDate currentDate);

    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.category IS NOT NULL AND p.category != '' ORDER BY p.category ASC")
    List<String> findDistinctCategories();

    long countByQuantityLessThanEqual(Integer minimumStockLevel);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.quantity <= p.minimumStockLevel")
    long countLowStockProducts();
}
