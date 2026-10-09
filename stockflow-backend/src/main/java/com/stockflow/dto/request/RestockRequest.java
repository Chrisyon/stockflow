package com.stockflow.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RestockRequest {

    @NotNull(message = "Product ID tidak boleh kosong")
    private Long productId;

    @NotNull(message = "Supplier ID tidak boleh kosong")
    private Long supplierId;

    @NotNull(message = "Jumlah restock (quantity) tidak boleh kosong")
    @Min(value = 1, message = "Jumlah restock minimal 1")
    private Integer quantity;

    private String referenceNumber;
    private String notes;
}
