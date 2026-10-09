package com.stockflow.service;

import com.stockflow.common.PagedResponse;
import com.stockflow.dto.request.ProductRequest;
import com.stockflow.dto.response.ProductResponse;

import java.util.List;

public interface ProductService {

    PagedResponse<ProductResponse> getAllProducts(String keyword, Long categoryId, int page, int size, String sortBy, String sortDir);

    ProductResponse getProductById(Long id);

    ProductResponse getProductBySku(String sku);

    List<ProductResponse> getLowStockProducts();

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);
}
