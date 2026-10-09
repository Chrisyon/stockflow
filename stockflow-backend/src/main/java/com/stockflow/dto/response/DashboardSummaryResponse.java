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
public class DashboardSummaryResponse {

    private BigDecimal totalRevenue;
    private BigDecimal totalGrossProfit;
    private Long totalTransactions;
    private Long totalProducts;
    private BigDecimal totalInventoryValue;
    private Long lowStockCount;
}
