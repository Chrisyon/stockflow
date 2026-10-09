package com.stockflow.dto.request;

import com.stockflow.entity.MovementType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StockAdjustmentRequest {

    @NotNull(message = "Product ID tidak boleh kosong")
    private Long productId;

    @NotNull(message = "Tipe adjustment (IN, OUT, ADJUSTMENT) tidak boleh kosong")
    private MovementType movementType;

    @NotNull(message = "Jumlah quantity tidak boleh kosong")
    private Integer quantity;

    private String notes;
}
