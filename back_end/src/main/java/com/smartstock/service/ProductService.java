package com.smartstock.service;

import com.smartstock.dto.PageResponse;
import com.smartstock.dto.ProductRequest;
import com.smartstock.dto.ProductResponse;

import java.util.List;

public interface ProductService {
    PageResponse<ProductResponse> getProducts(
            int page,
            int size,
            String search,
            String category,
            String stockStatus,
            String sortBy,
            String sortDir
    );

    ProductResponse getProductById(Long id);

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);

    List<String> getCategories();
}
