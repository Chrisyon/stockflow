package com.stockflow.repository;

import com.stockflow.entity.PaymentMethod;
import com.stockflow.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByInvoiceNumber(String invoiceNumber);

    Boolean existsByInvoiceNumber(String invoiceNumber);

    @Query("SELECT t FROM Transaction t WHERE " +
           "(:invoiceNumber IS NULL OR LOWER(t.invoiceNumber) LIKE LOWER(CONCAT('%', :invoiceNumber, '%'))) AND " +
           "(:paymentMethod IS NULL OR t.paymentMethod = :paymentMethod) AND " +
           "(:startDate IS NULL OR t.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR t.createdAt <= :endDate)")
    Page<Transaction> searchTransactions(@Param("invoiceNumber") String invoiceNumber,
                                         @Param("paymentMethod") PaymentMethod paymentMethod,
                                         @Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate,
                                         Pageable pageable);
}
