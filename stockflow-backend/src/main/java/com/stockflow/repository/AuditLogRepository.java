package com.stockflow.repository;

import com.stockflow.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByUserId(Long userId);

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:entityName IS NULL OR LOWER(a.entityName) LIKE LOWER(CONCAT('%', :entityName, '%'))) AND " +
           "(:action IS NULL OR LOWER(a.action) LIKE LOWER(CONCAT('%', :action, '%'))) AND " +
           "(:userId IS NULL OR a.user.id = :userId)")
    Page<AuditLog> searchAuditLogs(@Param("entityName") String entityName,
                                   @Param("action") String action,
                                   @Param("userId") Long userId,
                                   Pageable pageable);
}
