package com.stockflow.service;

import com.stockflow.dto.request.CheckoutRequest;
import com.stockflow.dto.request.TransactionItemRequest;
import com.stockflow.dto.response.TransactionResponse;
import com.stockflow.entity.*;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

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
    private Product sampleProduct;
    private CheckoutRequest checkoutRequest;

    @BeforeEach
    void setUp() {
        sampleCashier = User.builder()
                .id(2L)
                .username("kasir1")
                .fullName("Siti Rahma (Kasir Pagi)")
                .role(Role.CASHIER)
                .build();

        sampleProduct = Product.builder()
                .id(1L)
                .sku("PRD-SBK-001")
                .name("Beras Premium Ramos 5kg")
                .costPrice(new BigDecimal("62000.00"))
                .sellingPrice(new BigDecimal("74000.00"))
                .currentStock(10)
                .minStock(5)
                .unit("karung")
                .build();

        TransactionItemRequest itemReq = new TransactionItemRequest();
        itemReq.setProductId(1L);
        itemReq.setQuantity(2);

        checkoutRequest = new CheckoutRequest();
        checkoutRequest.setItems(List.of(itemReq));
        checkoutRequest.setDiscountAmount(new BigDecimal("5000.00"));
        checkoutRequest.setPaidAmount(new BigDecimal("150000.00"));
        checkoutRequest.setPaymentMethod(PaymentMethod.CASH);
    }

    @Test
    @DisplayName("Process Checkout POS Berhasil - Pessimistic Lock, Zero Trust Price & Stock Deduction")
    void testProcessTransactionSuccess() {
        when(userRepository.findByUsername("kasir1")).thenReturn(Optional.of(sampleCashier));
        when(productRepository.findByIdWithPessimisticLock(1L)).thenReturn(Optional.of(sampleProduct));

        Transaction savedTx = Transaction.builder()
                .id(100L)
                .invoiceNumber("INV-20261009-1234")
                .cashier(sampleCashier)
                .subtotal(new BigDecimal("148000.00")) // 74000 * 2
                .discountAmount(new BigDecimal("5000.00"))
                .totalAmount(new BigDecimal("143000.00"))
                .paidAmount(new BigDecimal("150000.00"))
                .changeAmount(new BigDecimal("7000.00"))
                .paymentMethod(PaymentMethod.CASH)
                .items(List.of(
                        TransactionDetail.builder()
                                .id(1L)
                                .product(sampleProduct)
                                .costPrice(new BigDecimal("62000.00"))
                                .sellingPrice(new BigDecimal("74000.00"))
                                .quantity(2)
                                .subtotal(new BigDecimal("148000.00"))
                                .build()
                ))
                .build();

        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTx);

        TransactionResponse response = transactionService.processTransaction(checkoutRequest, "kasir1");

        assertNotNull(response);
        assertEquals("INV-20261009-1234", response.getInvoiceNumber());
        assertEquals(new BigDecimal("143000.00"), response.getTotalAmount());
        assertEquals(new BigDecimal("7000.00"), response.getChangeAmount());
        assertEquals(8, sampleProduct.getCurrentStock()); // 10 - 2

        verify(productRepository, times(1)).findByIdWithPessimisticLock(1L);
        verify(stockMovementRepository, times(1)).saveAll(any());
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    @DisplayName("Process Checkout POS Gagal - InsufficientStockException Saat Stok Tidak Cukup")
    void testProcessTransactionInsufficientStockThrowsException() {
        sampleProduct.setCurrentStock(1); // Requested 2
        when(userRepository.findByUsername("kasir1")).thenReturn(Optional.of(sampleCashier));
        when(productRepository.findByIdWithPessimisticLock(1L)).thenReturn(Optional.of(sampleProduct));

        assertThrows(InsufficientStockException.class, () -> transactionService.processTransaction(checkoutRequest, "kasir1"));

        verify(transactionRepository, never()).save(any());
    }
}
