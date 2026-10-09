package com.stockflow.controller;

import com.stockflow.common.ApiResponse;
import com.stockflow.common.PagedResponse;
import com.stockflow.dto.request.CheckoutRequest;
import com.stockflow.dto.response.TransactionResponse;
import com.stockflow.entity.PaymentMethod;
import com.stockflow.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Tag(name = "Sales & POS Transaction Engine", description = "Endpoints untuk memproses checkout POS kasir, riwayat invoice, dan cetak struk")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CASHIER', 'ADMIN')")
    @Operation(summary = "Proses checkout penjualan POS (Atomic, Zero-Trust Price, Pessimistic Locking FOR UPDATE)")
    public ResponseEntity<ApiResponse<TransactionResponse>> processTransaction(
            @Valid @RequestBody CheckoutRequest request,
            Authentication authentication) {
        TransactionResponse response = transactionService.processTransaction(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Transaksi berhasil diproses"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detail transaksi & struk berdasarkan ID")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransactionById(@PathVariable Long id) {
        TransactionResponse response = transactionService.getTransactionById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Detail transaksi berhasil diambil"));
    }

    @GetMapping("/invoice/{invoiceNumber}")
    @Operation(summary = "Get detail transaksi & struk berdasarkan Invoice Number")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransactionByInvoiceNumber(@PathVariable String invoiceNumber) {
        TransactionResponse response = transactionService.getTransactionByInvoiceNumber(invoiceNumber);
        return ResponseEntity.ok(ApiResponse.success(response, "Detail transaksi berhasil diambil"));
    }

    @GetMapping
    @Operation(summary = "Search & filter riwayat transaksi penjualan")
    public ResponseEntity<ApiResponse<PagedResponse<TransactionResponse>>> searchTransactions(
            @RequestParam(required = false) String invoiceNumber,
            @RequestParam(required = false) PaymentMethod paymentMethod,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<TransactionResponse> response = transactionService.searchTransactions(invoiceNumber, paymentMethod, startDate, endDate, page, size);
        return ResponseEntity.ok(ApiResponse.success(response, "Riwayat transaksi berhasil diambil"));
    }
}
