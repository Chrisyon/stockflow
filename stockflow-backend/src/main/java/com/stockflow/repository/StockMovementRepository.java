package com.stockflow.repository;

import com.stockflow.entity.MovementType;
import com.stockflow.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findByProductId(Long productId);

    List<StockMovement> findByMovementType(MovementType movementType);

    @Query("SELECT sm FROM StockMovement sm WHERE " +
           "(:movementType IS NULL OR sm.movementType = :movementType) AND " +
           "(:productId IS NULL OR sm.product.id = :productId)")
    Page<StockMovement> searchMovements(@Param("movementType") MovementType movementType,
                                        @Param("productId") Long productId,
                                        Pageable pageable);
}
