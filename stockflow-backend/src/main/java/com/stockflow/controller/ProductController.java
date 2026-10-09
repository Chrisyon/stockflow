package com.stockflow.controller;

import com.stockflow.common.ApiResponse;
import com.stockflow.common.PagedResponse;
import com.stockflow.dto.request.ProductRequest;
import com.stockflow.dto.response.ProductResponse;
import com.stockflow.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Product Management", description = "Endpoints untuk mengelola katalog produk, SKU, dan stok minimum")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get list produk dengan pencarian, filter kategori, dan pagination")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> getAllProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PagedResponse<ProductResponse> products = productService.getAllProducts(keyword, categoryId, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(products, "Daftar produk berhasil diambil"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detail produk berdasarkan ID")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(product, "Detail produk berhasil diambil"));
    }

    @GetMapping("/sku/{sku}")
    @Operation(summary = "Get detail produk berdasarkan SKU (Scan Barcode)")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySku(@PathVariable String sku) {
        ProductResponse product = productService.getProductBySku(sku);
        return ResponseEntity.ok(ApiResponse.success(product, "Detail produk berhasil diambil"));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get daftar produk yang stoknya menipis (currentStock <= minStock)")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getLowStockProducts() {
        List<ProductResponse> lowStock = productService.getLowStockProducts();
        return ResponseEntity.ok(ApiResponse.success(lowStock, "Daftar produk stok menipis berhasil diambil"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tambah produk baru ke katalog (ADMIN only)")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse created = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created, "Produk berhasil ditambahkan"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update data produk (ADMIN only)")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        ProductResponse updated = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Produk berhasil diperbarui"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Hapus produk dari katalog (ADMIN only)")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Produk berhasil dihapus"));
    }
}
