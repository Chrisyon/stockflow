package com.stockflow.service;

import com.stockflow.dto.response.DashboardSummaryResponse;
import com.stockflow.dto.response.SalesReportResponse;
import com.stockflow.dto.response.TopSellingProductResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface ReportService {

    DashboardSummaryResponse getDashboardSummary();

    SalesReportResponse getSalesReport(LocalDateTime startDate, LocalDateTime endDate);

    List<TopSellingProductResponse> getTopSellingProducts(int limit);

    byte[] exportSalesToCsv(LocalDateTime startDate, LocalDateTime endDate);
}
