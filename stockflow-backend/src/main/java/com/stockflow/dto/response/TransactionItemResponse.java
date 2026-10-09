package com.stockflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private Integer quantity;
    private BigDecimal subtotal;
}
