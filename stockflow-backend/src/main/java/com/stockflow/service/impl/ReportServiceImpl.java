package com.stockflow.service.impl;

import com.stockflow.dto.response.DashboardSummaryResponse;
import com.stockflow.dto.response.SalesReportResponse;
import com.stockflow.dto.response.TopSellingProductResponse;
import com.stockflow.entity.Product;
import com.stockflow.entity.Transaction;
import com.stockflow.entity.TransactionDetail;
import com.stockflow.repository.ProductRepository;
import com.stockflow.repository.TransactionRepository;
import com.stockflow.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary() {
        List<Transaction> allTransactions = transactionRepository.findAll();
        List<Product> allProducts = productRepository.findAll();

        BigDecimal totalRevenue = allTransactions.stream()
                .map(Transaction::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalGrossProfit = calculateTotalGrossProfit(allTransactions);

        BigDecimal totalInventoryValue = allProducts.stream()
                .map(p -> p.getCostPrice().multiply(BigDecimal.valueOf(p.getCurrentStock())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long lowStockCount = allProducts.stream()
                .filter(p -> p.getCurrentStock() <= p.getMinStock())
                .count();

        return DashboardSummaryResponse.builder()
                .totalRevenue(totalRevenue)
                .totalGrossProfit(totalGrossProfit)
                .totalTransactions((long) allTransactions.size())
                .totalProducts((long) allProducts.size())
                .totalInventoryValue(totalInventoryValue)
                .lowStockCount(lowStockCount)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SalesReportResponse getSalesReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<Transaction> transactions = filterTransactionsByDate(startDate, endDate);

        BigDecimal totalRevenue = transactions.stream()
                .map(Transaction::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCost = transactions.stream()
                .flatMap(t -> t.getItems().stream())
                .map(item -> item.getCostPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalGrossProfit = totalRevenue.subtract(totalCost);

        long totalItemsSold = transactions.stream()
                .flatMap(t -> t.getItems().stream())
                .mapToLong(TransactionDetail::getQuantity)
                .sum();

        BigDecimal avgBasketSize = transactions.isEmpty() ? BigDecimal.ZERO :
                totalRevenue.divide(BigDecimal.valueOf(transactions.size()), 2, RoundingMode.HALF_UP);

        List<TopSellingProductResponse> topSelling = calculateTopSellingProducts(transactions, 5);

        return SalesReportResponse.builder()
                .totalRevenue(totalRevenue)
                .totalCost(totalCost)
                .totalGrossProfit(totalGrossProfit)
                .totalTransactions((long) transactions.size())
                .averageBasketSize(avgBasketSize)
                .totalItemsSold(totalItemsSold)
                .topSellingProducts(topSelling)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopSellingProductResponse> getTopSellingProducts(int limit) {
        List<Transaction> allTransactions = transactionRepository.findAll();
        return calculateTopSellingProducts(allTransactions, limit);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportSalesToCsv(LocalDateTime startDate, LocalDateTime endDate) {
        List<Transaction> transactions = filterTransactionsByDate(startDate, endDate);

        StringBuilder csv = new StringBuilder();
        csv.append("InvoiceNumber,Tanggal,Kasir,MetodePembayaran,Subtotal,Diskon,TotalAmount,PaidAmount,ChangeAmount\n");

        for (Transaction t : transactions) {
            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",%.2f,%.2f,%.2f,%.2f,%.2f\n",
                    t.getInvoiceNumber(),
                    t.getCreatedAt(),
                    t.getCashier().getFullName(),
                    t.getPaymentMethod(),
                    t.getSubtotal(),
                    t.getDiscountAmount(),
                    t.getTotalAmount(),
                    t.getPaidAmount(),
                    t.getChangeAmount()));
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private List<Transaction> filterTransactionsByDate(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null && endDate == null) {
            return transactionRepository.findAll();
        }
        return transactionRepository.findAll().stream()
                .filter(t -> (startDate == null || !t.getCreatedAt().isBefore(startDate)) &&
                             (endDate == null || !t.getCreatedAt().isAfter(endDate)))
                .collect(Collectors.toList());
    }

    private BigDecimal calculateTotalGrossProfit(List<Transaction> transactions) {
        return transactions.stream()
                .flatMap(t -> t.getItems().stream())
                .map(item -> item.getSellingPrice().subtract(item.getCostPrice()).multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<TopSellingProductResponse> calculateTopSellingProducts(List<Transaction> transactions, int limit) {
        Map<Long, TopSellingProductResponse> map = new HashMap<>();

        for (Transaction t : transactions) {
            for (TransactionDetail detail : t.getItems()) {
                Long pId = detail.getProduct().getId();
                TopSellingProductResponse existing = map.getOrDefault(pId, TopSellingProductResponse.builder()
                        .productId(pId)
                        .productName(detail.getProduct().getName())
                        .productSku(detail.getProduct().getSku())
                        .quantitySold(0L)
                        .totalRevenue(BigDecimal.ZERO)
                        .build());

                existing.setQuantitySold(existing.getQuantitySold() + detail.getQuantity());
                existing.setTotalRevenue(existing.getTotalRevenue().add(detail.getSubtotal()));

                map.put(pId, existing);
            }
        }

        return map.values().stream()
                .sorted((a, b) -> Long.compare(b.getQuantitySold(), a.getQuantitySold()))
                .limit(limit)
                .collect(Collectors.toList());
    }
}
