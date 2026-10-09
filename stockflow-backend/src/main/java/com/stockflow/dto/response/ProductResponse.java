package com.stockflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private Long id;
    private String sku;
    private String name;
    private Long categoryId;
    private String categoryName;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private BigDecimal margin;
    private Integer currentStock;
    private Integer minStock;
    private String unit;
    private Boolean isLowStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
