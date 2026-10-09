package com.stockflow.dto.response;

import com.stockflow.entity.MovementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private MovementType movementType;
    private Integer quantity;
    private String referenceNumber;
    private String notes;
    private Long createdByUserId;
    private String createdByName;
    private LocalDateTime createdAt;
}
