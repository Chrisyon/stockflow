package com.stockflow.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {

    @NotBlank(message = "SKU produk tidak boleh kosong")
    private String sku;

    @NotBlank(message = "Nama produk tidak boleh kosong")
    private String name;

    @NotNull(message = "Kategori ID tidak boleh kosong")
    private Long categoryId;

    @NotNull(message = "Harga modal tidak boleh kosong")
    @DecimalMin(value = "0.0", message = "Harga modal tidak boleh negatif")
    private BigDecimal costPrice;

    @NotNull(message = "Harga jual tidak boleh kosong")
    @DecimalMin(value = "0.0", message = "Harga jual tidak boleh negatif")
    private BigDecimal sellingPrice;

    @NotNull(message = "Stok awal tidak boleh kosong")
    @Min(value = 0, message = "Stok awal tidak boleh negatif")
    private Integer currentStock;

    @NotNull(message = "Batas stok minimum tidak boleh kosong")
    @Min(value = 1, message = "Batas stok minimum minimal 1")
    private Integer minStock;

    @NotBlank(message = "Satuan unit tidak boleh kosong")
    private String unit;
}
