package com.stockflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesReportResponse {

    private BigDecimal totalRevenue;
    private BigDecimal totalCost;
    private BigDecimal totalGrossProfit;
    private Long totalTransactions;
    private BigDecimal averageBasketSize;
    private Long totalItemsSold;
    private List<TopSellingProductResponse> topSellingProducts;
}
