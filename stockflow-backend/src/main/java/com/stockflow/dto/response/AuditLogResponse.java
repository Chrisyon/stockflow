package com.stockflow.dto.response;

import com.stockflow.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {

    private Long id;
    private Long userId;
    private String userName;
    private Role userRole;
    private String action;
    private String entityName;
    private String entityId;
    private String details;
    private LocalDateTime createdAt;
}
