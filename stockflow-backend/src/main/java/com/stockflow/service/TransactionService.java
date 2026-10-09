package com.stockflow.service;

import com.stockflow.common.PagedResponse;
import com.stockflow.dto.request.CheckoutRequest;
import com.stockflow.dto.response.TransactionResponse;
import com.stockflow.entity.PaymentMethod;

import java.time.LocalDateTime;

public interface TransactionService {

    TransactionResponse processTransaction(CheckoutRequest request, String cashierUsername);

    TransactionResponse getTransactionById(Long id);

    TransactionResponse getTransactionByInvoiceNumber(String invoiceNumber);

    PagedResponse<TransactionResponse> searchTransactions(String invoiceNumber, PaymentMethod paymentMethod, LocalDateTime startDate, LocalDateTime endDate, int page, int size);
}
