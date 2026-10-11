package com.smartstock.service.impl;

import com.smartstock.dto.PageResponse;
import com.smartstock.dto.ProductRequest;
import com.smartstock.dto.ProductResponse;
import com.smartstock.entity.Product;
import com.smartstock.entity.Supplier;
import com.smartstock.exception.BadRequestException;
import com.smartstock.exception.ResourceNotFoundException;
import com.smartstock.mapper.EntityMapper;
import com.smartstock.repository.ProductRepository;
import com.smartstock.repository.SupplierRepository;
import com.smartstock.service.ProductService;
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
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final EntityMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProducts(
            int page,
            int size,
            String search,
            String category,
            String stockStatus,
            String sortBy,
            String sortDir) {

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortField = StringUtils.hasText(sortBy) ? sortBy : "createdAt";
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));

        String searchParam = StringUtils.hasText(search) ? search.trim() : null;
        String categoryParam = StringUtils.hasText(category) && !"ALL".equalsIgnoreCase(category) ? category.trim() : null;
        String stockStatusParam = StringUtils.hasText(stockStatus) && !"ALL".equalsIgnoreCase(stockStatus) ? stockStatus.trim() : null;

        Page<Product> productPage = productRepository.findWithFilters(searchParam, categoryParam, stockStatusParam, pageable);

        List<ProductResponse> content = productPage.getContent().stream()
                .map(mapper::toProductResponse)
                .collect(Collectors.toList());

        return PageResponse.<ProductResponse>builder()
                .content(content)
                .pageNumber(productPage.getNumber())
                .pageSize(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        return mapper.toProductResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku().trim())) {
            throw new BadRequestException("Product with SKU '" + request.getSku().trim() + "' already exists.");
        }

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + request.getSupplierId()));
        }

        Product product = Product.builder()
                .name(request.getName().trim())
                .sku(request.getSku().trim().toUpperCase())
                .category(request.getCategory().trim())
                .purchasePrice(request.getPurchasePrice())
                .sellingPrice(request.getSellingPrice())
                .quantity(request.getQuantity())
                .minimumStockLevel(request.getMinimumStockLevel() != null ? request.getMinimumStockLevel() : 5)
                .expiryDate(request.getExpiryDate())
                .supplier(supplier)
                .build();

        Product saved = productRepository.save(product);
        return mapper.toProductResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        if (productRepository.existsBySkuAndIdNot(request.getSku().trim(), id)) {
            throw new BadRequestException("SKU '" + request.getSku().trim() + "' is already assigned to another product.");
        }

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + request.getSupplierId()));
        }

        product.setName(request.getName().trim());
        product.setSku(request.getSku().trim().toUpperCase());
        product.setCategory(request.getCategory().trim());
        product.setPurchasePrice(request.getPurchasePrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setQuantity(request.getQuantity());
        product.setMinimumStockLevel(request.getMinimumStockLevel());
        product.setExpiryDate(request.getExpiryDate());
        product.setSupplier(supplier);

        Product updated = productRepository.save(product);
        return mapper.toProductResponse(updated);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with ID: " + id);
        }
        productRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getCategories() {
        return productRepository.findDistinctCategories();
    }
}
