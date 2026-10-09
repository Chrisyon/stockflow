package com.stockflow.dto.request;

import com.stockflow.entity.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CheckoutRequest {

    @NotEmpty(message = "Keranjang belanja tidak boleh kosong")
    @Valid
    private List<TransactionItemRequest> items;

    @DecimalMin(value = "0.0", message = "Diskon tidak boleh negatif")
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @NotNull(message = "Jumlah uang dibayar tidak boleh kosong")
    @DecimalMin(value = "0.0", message = "Jumlah uang dibayar tidak boleh negatif")
    private BigDecimal paidAmount;

    @NotNull(message = "Metode pembayaran tidak boleh kosong")
    private PaymentMethod paymentMethod;
}
