package com.stockflow.service;

import com.stockflow.dto.response.SalesReportResponse;
import com.stockflow.entity.PaymentMethod;
import com.stockflow.entity.Product;
import com.stockflow.entity.Transaction;
import com.stockflow.entity.TransactionDetail;
import com.stockflow.repository.ProductRepository;
import com.stockflow.repository.TransactionRepository;
import com.stockflow.service.impl.ReportServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ReportServiceImpl reportService;

    private Transaction tx1;
    private Transaction tx2;

    @BeforeEach
    void setUp() {
        Product p = Product.builder()
                .id(1L)
                .name("Beras Ramos")
                .sku("PRD-001")
                .build();

        tx1 = Transaction.builder()
                .id(1L)
                .invoiceNumber("INV-20261001-01")
                .subtotal(new BigDecimal("100000.00"))
                .totalAmount(new BigDecimal("100000.00"))
                .discountAmount(BigDecimal.ZERO)
                .paymentMethod(PaymentMethod.CASH)
                .createdAt(LocalDateTime.of(2026, 10, 1, 10, 0))
                .items(List.of(TransactionDetail.builder()
                        .product(p)
                        .costPrice(new BigDecimal("80000.00"))
                        .sellingPrice(new BigDecimal("100000.00"))
                        .quantity(1)
                        .subtotal(new BigDecimal("100000.00"))
                        .build()))
                .build();

        tx2 = Transaction.builder()
                .id(2L)
                .invoiceNumber("INV-20261008-01")
                .subtotal(new BigDecimal("50000.00"))
                .totalAmount(new BigDecimal("50000.00"))
                .discountAmount(BigDecimal.ZERO)
                .paymentMethod(PaymentMethod.QRIS)
                .createdAt(LocalDateTime.of(2026, 10, 8, 14, 0))
                .items(List.of(TransactionDetail.builder()
                        .product(p)
                        .costPrice(new BigDecimal("40000.00"))
                        .sellingPrice(new BigDecimal("50000.00"))
                        .quantity(1)
                        .subtotal(new BigDecimal("50000.00"))
                        .build()))
                .build();
    }

    @Test
    @DisplayName("Filter Laporan Penjualan Berdasarkan Rentang Tanggal")
    void testGetSalesReportDateRangeFilter() {
        when(transactionRepository.findAll()).thenReturn(List.of(tx1, tx2));

        LocalDateTime start = LocalDateTime.of(2026, 10, 5, 0, 0);
        LocalDateTime end = LocalDateTime.of(2026, 10, 9, 23, 59);

        SalesReportResponse report = reportService.getSalesReport(start, end);

        assertNotNull(report);
        assertEquals(1L, report.getTotalTransactions()); // Only tx2 matches date range
        assertEquals(new BigDecimal("50000.00"), report.getTotalRevenue());
        assertEquals(new BigDecimal("10000.00"), report.getTotalGrossProfit()); // 50000 - 40000
    }
}
