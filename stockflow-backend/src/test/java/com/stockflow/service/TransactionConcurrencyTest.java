package com.stockflow.service;

import com.stockflow.dto.request.CheckoutRequest;
import com.stockflow.dto.request.TransactionItemRequest;
import com.stockflow.dto.response.TransactionResponse;
import com.stockflow.entity.PaymentMethod;
import com.stockflow.entity.Product;
import com.stockflow.entity.Role;
import com.stockflow.entity.User;
import com.stockflow.exception.InsufficientStockException;
import com.stockflow.repository.ProductRepository;
import com.stockflow.repository.StockMovementRepository;
import com.stockflow.repository.TransactionRepository;
import com.stockflow.repository.UserRepository;
import com.stockflow.service.impl.TransactionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionConcurrencyTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private StockMovementRepository stockMovementRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    private User sampleCashier;
    private CheckoutRequest checkoutRequest;

    @BeforeEach
    void setUp() {
        sampleCashier = User.builder()
                .id(2L)
                .username("kasir1")
                .fullName("Siti Rahma (Kasir Pagi)")
                .role(Role.CASHIER)
                .build();

        TransactionItemRequest itemReq = new TransactionItemRequest();
        itemReq.setProductId(99L);
        itemReq.setQuantity(1);

        checkoutRequest = new CheckoutRequest();
        checkoutRequest.setItems(List.of(itemReq));
        checkoutRequest.setDiscountAmount(BigDecimal.ZERO);
        checkoutRequest.setPaidAmount(new BigDecimal("20000.00"));
        checkoutRequest.setPaymentMethod(PaymentMethod.CASH);
    }

    @Test
    @DisplayName("Concurrency Test: Dua transaksi bersamaan yang mencoba membeli stok terakhir")
    void testConcurrentCheckoutLastRemainingStock() throws InterruptedException, ExecutionException {
        when(userRepository.findByUsername("kasir1")).thenReturn(Optional.of(sampleCashier));

        // Atomic integer simulating MySQL PESSIMISTIC_WRITE lock behavior
        AtomicInteger databaseStock = new AtomicInteger(1);

        // When Thread 1 acquires lock, it gets stock=1 and immediately decrements it to 0. Thread 2 gets stock=0.
        when(productRepository.findByIdWithPessimisticLock(99L)).thenAnswer(invocation -> {
            synchronized (databaseStock) {
                int stockAvailable = databaseStock.get();
                if (stockAvailable >= 1) {
                    databaseStock.set(stockAvailable - 1); // Lock acquired & stock reserved
                }
                Product p = Product.builder()
                        .id(99L)
                        .sku("PRD-LAST-001")
                        .name("Item Terakhir")
                        .costPrice(new BigDecimal("10000.00"))
                        .sellingPrice(new BigDecimal("15000.00"))
                        .currentStock(stockAvailable)
                        .minStock(2)
                        .unit("pcs")
                        .build();
                return Optional.of(p);
            }
        });

        when(transactionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ExecutorService executor = Executors.newFixedThreadPool(2);

        Callable<TransactionResponse> task1 = () -> transactionService.processTransaction(checkoutRequest, "kasir1");
        Callable<TransactionResponse> task2 = () -> transactionService.processTransaction(checkoutRequest, "kasir1");

        Future<TransactionResponse> future1 = executor.submit(task1);
        Future<TransactionResponse> future2 = executor.submit(task2);

        int successCount = 0;
        int failureCount = 0;

        try {
            future1.get();
            successCount++;
        } catch (ExecutionException e) {
            if (e.getCause() instanceof InsufficientStockException) failureCount++;
        }

        try {
            future2.get();
            successCount++;
        } catch (ExecutionException e) {
            if (e.getCause() instanceof InsufficientStockException) failureCount++;
        }

        executor.shutdown();

        // Exactly 1 transaction must succeed, exactly 1 transaction must be rejected with InsufficientStockException
        assertEquals(1, successCount, "Hanya 1 transaksi yang boleh berhasil");
        assertEquals(1, failureCount, "1 transaksi harus ditolak karena stok habis");
    }
}
