package com.stockflow.service;

import com.stockflow.common.PagedResponse;
import com.stockflow.dto.request.RestockRequest;
import com.stockflow.dto.request.StockAdjustmentRequest;
import com.stockflow.dto.response.StockMovementResponse;
import com.stockflow.entity.MovementType;

public interface InventoryService {

    StockMovementResponse processRestock(RestockRequest request, String currentUsername);

    StockMovementResponse processStockAdjustment(StockAdjustmentRequest request, String currentUsername);

    PagedResponse<StockMovementResponse> getStockMovements(MovementType movementType, Long productId, int page, int size);
}
