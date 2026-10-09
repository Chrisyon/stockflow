package com.stockflow.service.impl;

import com.stockflow.common.PagedResponse;
import com.stockflow.dto.request.CheckoutRequest;
import com.stockflow.dto.request.TransactionItemRequest;
import com.stockflow.dto.response.TransactionItemResponse;
import com.stockflow.dto.response.TransactionResponse;
import com.stockflow.entity.*;
import com.stockflow.exception.BadRequestException;
import com.stockflow.exception.InsufficientStockException;
import com.stockflow.exception.ResourceNotFoundException;
import com.stockflow.repository.ProductRepository;
import com.stockflow.repository.StockMovementRepository;
import com.stockflow.repository.TransactionRepository;
import com.stockflow.repository.UserRepository;
import com.stockflow.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final ProductRepository productRepository;
    private final TransactionRepository transactionRepository;
    private final StockMovementRepository stockMovementRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public TransactionResponse processTransaction(CheckoutRequest request, String cashierUsername) {
        User cashier = userRepository.findByUsername(cashierUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", cashierUsername));

        String invoiceNumber = generateInvoiceNumber();

        BigDecimal subtotal = BigDecimal.ZERO;
        List<TransactionDetail> transactionDetails = new ArrayList<>();
        List<StockMovement> stockMovements = new ArrayList<>();

        // Process each item with Pessimistic Lock & Zero-Trust Calculation
        for (TransactionItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findByIdWithPessimisticLock(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemReq.getProductId()));

            // 1. Stock Availability Check
            if (product.getCurrentStock() < itemReq.getQuantity()) {
                throw new InsufficientStockException(product.getName(), product.getCurrentStock(), itemReq.getQuantity());
            }

            // 2. Zero-Trust Price Calculation from DB
            BigDecimal itemSubtotal = product.getSellingPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(itemSubtotal);

            // 3. Deduct Product Stock
            product.setCurrentStock(product.getCurrentStock() - itemReq.getQuantity());
            productRepository.save(product);

            // 4. Prepare Transaction Detail Record
            TransactionDetail detail = TransactionDetail.builder()
                    .product(product)
                    .costPrice(product.getCostPrice())
                    .sellingPrice(product.getSellingPrice())
                    .quantity(itemReq.getQuantity())
                    .subtotal(itemSubtotal)
                    .build();

            transactionDetails.add(detail);

            // 5. Prepare Stock Movement Record
            StockMovement movement = StockMovement.builder()
                    .product(product)
                    .movementType(MovementType.SALE)
                    .quantity(-itemReq.getQuantity())
                    .referenceNumber(invoiceNumber)
                    .notes("Penjualan POS Invoice " + invoiceNumber)
                    .createdBy(cashier)
                    .build();

            stockMovements.add(movement);
        }

        // Discount & Payment Validation
        BigDecimal discount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.subtract(discount);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalAmount = BigDecimal.ZERO;
        }

        if (request.getPaidAmount().compareTo(totalAmount) < 0) {
            throw new BadRequestException(String.format("Jumlah uang dibayar (Rp %s) kurang dari total tagihan (Rp %s)", request.getPaidAmount(), totalAmount));
        }

        BigDecimal changeAmount = request.getPaidAmount().subtract(totalAmount);

        // Save Transaction Header
        Transaction transaction = Transaction.builder()
                .invoiceNumber(invoiceNumber)
                .cashier(cashier)
                .subtotal(subtotal)
                .discountAmount(discount)
                .totalAmount(totalAmount)
                .paidAmount(request.getPaidAmount())
                .changeAmount(changeAmount)
                .paymentMethod(request.getPaymentMethod())
                .build();

        // Link details to header
        transactionDetails.forEach(detail -> detail.setTransaction(transaction));
        transaction.setItems(transactionDetails);

        Transaction savedTransaction = transactionRepository.save(transaction);
        stockMovementRepository.saveAll(stockMovements);

        return mapToResponse(savedTransaction);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));
        return mapToResponse(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionByInvoiceNumber(String invoiceNumber) {
        Transaction transaction = transactionRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "invoiceNumber", invoiceNumber));
        return mapToResponse(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TransactionResponse> searchTransactions(String invoiceNumber, PaymentMethod paymentMethod, LocalDateTime startDate, LocalDateTime endDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Transaction> transactions = transactionRepository.searchTransactions(invoiceNumber, paymentMethod, startDate, endDate, pageable);

        List<TransactionResponse> content = transactions.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PagedResponse.<TransactionResponse>builder()
                .content(content)
                .pageNumber(transactions.getNumber())
                .pageSize(transactions.getSize())
                .totalElements(transactions.getTotalElements())
                .totalPages(transactions.getTotalPages())
                .last(transactions.isLast())
                .build();
    }

    private String generateInvoiceNumber() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomPart = new Random().nextInt(9000) + 1000;
        return "INV-" + datePart + "-" + randomPart;
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        List<TransactionItemResponse> items = transaction.getItems().stream()
                .map(it -> TransactionItemResponse.builder()
                        .id(it.getId())
                        .productId(it.getProduct().getId())
                        .productName(it.getProduct().getName())
                        .productSku(it.getProduct().getSku())
                        .costPrice(it.getCostPrice())
                        .sellingPrice(it.getSellingPrice())
                        .quantity(it.getQuantity())
                        .subtotal(it.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return TransactionResponse.builder()
                .id(transaction.getId())
                .invoiceNumber(transaction.getInvoiceNumber())
                .cashierId(transaction.getCashier().getId())
                .cashierName(transaction.getCashier().getFullName())
                .subtotal(transaction.getSubtotal())
                .discountAmount(transaction.getDiscountAmount())
                .totalAmount(transaction.getTotalAmount())
                .paidAmount(transaction.getPaidAmount())
                .changeAmount(transaction.getChangeAmount())
                .paymentMethod(transaction.getPaymentMethod())
                .createdAt(transaction.getCreatedAt())
                .items(items)
                .build();
    }
}
