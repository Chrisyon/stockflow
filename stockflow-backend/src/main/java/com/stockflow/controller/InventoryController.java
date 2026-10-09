package com.stockflow.controller;

import com.stockflow.common.ApiResponse;
import com.stockflow.common.PagedResponse;
import com.stockflow.dto.request.RestockRequest;
import com.stockflow.dto.request.StockAdjustmentRequest;
import com.stockflow.dto.response.StockMovementResponse;
import com.stockflow.entity.MovementType;
import com.stockflow.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory Management", description = "Endpoints untuk mencatat restock supplier, stock adjustment opname, dan riwayat pergerakan stok")
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/restock")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Catat penerimaan stok masuk dari Supplier (ADMIN only)")
    public ResponseEntity<ApiResponse<StockMovementResponse>> restock(
            @Valid @RequestBody RestockRequest request,
            Authentication authentication) {
        StockMovementResponse response = inventoryService.processRestock(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Restock produk berhasil dicatat"));
    }

    @PostMapping("/adjustment")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lakukan penyesuaian stok manual / opname / barang rusak (ADMIN only)")
    public ResponseEntity<ApiResponse<StockMovementResponse>> stockAdjustment(
            @Valid @RequestBody StockAdjustmentRequest request,
            Authentication authentication) {
        StockMovementResponse response = inventoryService.processStockAdjustment(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Stock adjustment berhasil dicatat"));
    }

    @GetMapping("/movements")
    @Operation(summary = "Get list riwayat pergerakan stok (Filter by Type, Product, Pagination)")
    public ResponseEntity<ApiResponse<PagedResponse<StockMovementResponse>>> getStockMovements(
            @RequestParam(required = false) MovementType movementType,
            @RequestParam(required = false) Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<StockMovementResponse> response = inventoryService.getStockMovements(movementType, productId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response, "Riwayat pergerakan stok berhasil diambil"));
    }
}
