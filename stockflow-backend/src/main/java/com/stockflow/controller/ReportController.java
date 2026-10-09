package com.stockflow.controller;

import com.stockflow.common.ApiResponse;
import com.stockflow.dto.response.DashboardSummaryResponse;
import com.stockflow.dto.response.SalesReportResponse;
import com.stockflow.dto.response.TopSellingProductResponse;
import com.stockflow.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports & Analytics", description = "Endpoints untuk eksekutif dashboard, statistik penjualan, gross profit margin, dan ekspor CSV")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    @Operation(summary = "Get statistik ringkasan dashboard (Omset, Gross Profit, Total SKU, Low Stock)")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary() {
        DashboardSummaryResponse summary = reportService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.success(summary, "Ringkasan dashboard berhasil diambil"));
    }

    @GetMapping("/sales")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    @Operation(summary = "Get laporan keuangan penjualan (Revenue, Cost, Profit, Average Basket Size)")
    public ResponseEntity<ApiResponse<SalesReportResponse>> getSalesReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        SalesReportResponse report = reportService.getSalesReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(report, "Laporan penjualan berhasil diambil"));
    }

    @GetMapping("/top-selling")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    @Operation(summary = "Get N produk terlaris berdasarkan volume penjualan")
    public ResponseEntity<ApiResponse<List<TopSellingProductResponse>>> getTopSellingProducts(
            @RequestParam(defaultValue = "5") int limit) {
        List<TopSellingProductResponse> topSelling = reportService.getTopSellingProducts(limit);
        return ResponseEntity.ok(ApiResponse.success(topSelling, "Top produk terlaris berhasil diambil"));
    }

    @GetMapping("/sales/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    @Operation(summary = "Ekspor laporan transaksi penjualan dalam format file CSV")
    public ResponseEntity<byte[]> exportSalesToCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        byte[] csvData = reportService.exportSalesToCsv(startDate, endDate);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=StockFlow_SalesReport.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }
}
