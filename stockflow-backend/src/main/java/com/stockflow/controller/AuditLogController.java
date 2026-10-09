package com.stockflow.controller;

import com.stockflow.common.ApiResponse;
import com.stockflow.common.PagedResponse;
import com.stockflow.dto.response.AuditLogResponse;
import com.stockflow.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logging", description = "Endpoints untuk memantau jejak audit aktivitas pengguna sistem")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    @Operation(summary = "Get list log aktivitas penting pengguna (Filter & Pagination)")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLogResponse>>> getAuditLogs(
            @RequestParam(required = false) String entityName,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<AuditLogResponse> response = auditLogService.getAuditLogs(entityName, action, userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response, "Audit logs berhasil diambil"));
    }
}
