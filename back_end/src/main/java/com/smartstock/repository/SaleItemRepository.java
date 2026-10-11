package com.smartstock.repository;

import com.smartstock.entity.SaleItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    List<SaleItem> findBySaleId(Long saleId);

    @Query("SELECT si.product.id, si.product.name, si.product.sku, SUM(si.quantity), SUM(si.lineTotal) " +
           "FROM SaleItem si " +
           "GROUP BY si.product.id, si.product.name, si.product.sku " +
           "ORDER BY SUM(si.quantity) DESC")
    List<Object[]> findBestSellingProducts(Pageable pageable);

    @Query("SELECT si FROM SaleItem si WHERE si.sale.createdAt >= :startDate AND si.sale.createdAt <= :endDate")
    List<SaleItem> findSaleItemsBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
