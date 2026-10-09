package com.stockflow.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TransactionItemRequest {

    @NotNull(message = "Product ID tidak boleh kosong")
    private Long productId;

    @NotNull(message = "Jumlah item (quantity) tidak boleh kosong")
    @Min(value = 1, message = "Jumlah item minimal 1")
    private Integer quantity;
}
