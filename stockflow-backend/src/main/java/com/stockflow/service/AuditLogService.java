package com.stockflow.service;

import com.stockflow.common.PagedResponse;
import com.stockflow.dto.response.AuditLogResponse;

public interface AuditLogService {

    void logActivity(String username, String action, String entityName, String entityId, String details);

    PagedResponse<AuditLogResponse> getAuditLogs(String entityName, String action, Long userId, int page, int size);
}
