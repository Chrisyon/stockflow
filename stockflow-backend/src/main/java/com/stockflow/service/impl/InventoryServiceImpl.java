package com.stockflow.service.impl;

import com.stockflow.common.PagedResponse;
import com.stockflow.dto.request.RestockRequest;
import com.stockflow.dto.request.StockAdjustmentRequest;
import com.stockflow.dto.response.StockMovementResponse;
import com.stockflow.entity.MovementType;
import com.stockflow.entity.Product;
import com.stockflow.entity.StockMovement;
import com.stockflow.entity.Supplier;
import com.stockflow.entity.User;
import com.stockflow.exception.BadRequestException;
import com.stockflow.exception.ResourceNotFoundException;
import com.stockflow.repository.ProductRepository;
import com.stockflow.repository.StockMovementRepository;
import com.stockflow.repository.SupplierRepository;
import com.stockflow.repository.UserRepository;
import com.stockflow.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final StockMovementRepository stockMovementRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public StockMovementResponse processRestock(RestockRequest request, String currentUsername) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUsername));

        // 1. Update Product Stock
        product.setCurrentStock(product.getCurrentStock() + request.getQuantity());
        productRepository.save(product);

        // 2. Log Stock Movement
        String notes = "Restock dari supplier " + supplier.getName() + (request.getNotes() != null ? ". " + request.getNotes() : "");
        StockMovement movement = StockMovement.builder()
                .product(product)
                .movementType(MovementType.IN)
                .quantity(request.getQuantity())
                .referenceNumber(request.getReferenceNumber() != null ? request.getReferenceNumber() : "RESTOCK-" + System.currentTimeMillis())
                .notes(notes)
                .createdBy(user)
                .build();

        StockMovement saved = stockMovementRepository.save(movement);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public StockMovementResponse processStockAdjustment(StockAdjustmentRequest request, String currentUsername) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUsername));

        int qtyChange = request.getQuantity();
        if (request.getMovementType() == MovementType.OUT) {
            qtyChange = -Math.abs(qtyChange);
        }

        int newStock = product.getCurrentStock() + qtyChange;
        if (newStock < 0) {
            throw new BadRequestException("Stok tidak boleh menjadi negatif. Stok saat ini: " + product.getCurrentStock() + ", perubahan: " + qtyChange);
        }

        // 1. Update Product Stock
        product.setCurrentStock(newStock);
        productRepository.save(product);

        // 2. Log Stock Movement
        StockMovement movement = StockMovement.builder()
                .product(product)
                .movementType(request.getMovementType())
                .quantity(qtyChange)
                .referenceNumber("ADJ-" + System.currentTimeMillis())
                .notes(request.getNotes() != null ? request.getNotes() : "Penyesuaian stok manual")
                .createdBy(user)
                .build();

        StockMovement saved = stockMovementRepository.save(movement);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<StockMovementResponse> getStockMovements(MovementType movementType, Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<StockMovement> movements = stockMovementRepository.searchMovements(movementType, productId, pageable);

        List<StockMovementResponse> content = movements.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PagedResponse.<StockMovementResponse>builder()
                .content(content)
                .pageNumber(movements.getNumber())
                .pageSize(movements.getSize())
                .totalElements(movements.getTotalElements())
                .totalPages(movements.getTotalPages())
                .last(movements.isLast())
                .build();
    }

    private StockMovementResponse mapToResponse(StockMovement movement) {
        return StockMovementResponse.builder()
                .id(movement.getId())
                .productId(movement.getProduct().getId())
                .productName(movement.getProduct().getName())
                .productSku(movement.getProduct().getSku())
                .movementType(movement.getMovementType())
                .quantity(movement.getQuantity())
                .referenceNumber(movement.getReferenceNumber())
                .notes(movement.getNotes())
                .createdByUserId(movement.getCreatedBy().getId())
                .createdByName(movement.getCreatedBy().getFullName())
                .createdAt(movement.getCreatedAt())
                .build();
    }
}
