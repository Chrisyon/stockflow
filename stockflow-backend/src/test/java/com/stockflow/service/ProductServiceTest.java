package com.stockflow.service;

import com.stockflow.dto.request.ProductRequest;
import com.stockflow.dto.response.ProductResponse;
import com.stockflow.entity.Category;
import com.stockflow.entity.Product;
import com.stockflow.exception.BadRequestException;
import com.stockflow.repository.CategoryRepository;
import com.stockflow.repository.ProductRepository;
import com.stockflow.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private Category sampleCategory;
    private Product sampleProduct;
    private ProductRequest productRequest;

    @BeforeEach
    void setUp() {
        sampleCategory = Category.builder()
                .id(1L)
                .name("Sembako & Beras")
                .description("Kebutuhan Pokok")
                .build();

        sampleProduct = Product.builder()
                .id(10L)
                .sku("PRD-SBK-001")
                .name("Beras Premium Ramos 5kg")
                .category(sampleCategory)
                .costPrice(new BigDecimal("62000.00"))
                .sellingPrice(new BigDecimal("74000.00"))
                .currentStock(20)
                .minStock(5)
                .unit("karung")
                .build();

        productRequest = new ProductRequest();
        productRequest.setSku("PRD-SBK-001");
        productRequest.setName("Beras Premium Ramos 5kg");
        productRequest.setCategoryId(1L);
        productRequest.setCostPrice(new BigDecimal("62000.00"));
        productRequest.setSellingPrice(new BigDecimal("74000.00"));
        productRequest.setCurrentStock(20);
        productRequest.setMinStock(5);
        productRequest.setUnit("karung");
    }

    @Test
    @DisplayName("Create Product Berhasil - Menghitung Margin dan Menyimpan Produk")
    void testCreateProductSuccess() {
        when(productRepository.existsBySku("PRD-SBK-001")).thenReturn(false);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sampleCategory));
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        ProductResponse response = productService.createProduct(productRequest);

        assertNotNull(response);
        assertEquals("PRD-SBK-001", response.getSku());
        assertEquals(new BigDecimal("12000.00"), response.getMargin()); // 74000 - 62000
        assertFalse(response.getIsLowStock());

        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("Create Product Gagal - Throw BadRequestException Saat SKU Duplikat")
    void testCreateProductDuplicateSkuThrowsException() {
        when(productRepository.existsBySku("PRD-SBK-001")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> productService.createProduct(productRequest));
        verify(productRepository, never()).save(any());
    }
}
