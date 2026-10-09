package com.stockflow.controller;

import com.stockflow.common.ApiResponse;
import com.stockflow.dto.request.LoginRequest;
import com.stockflow.dto.response.JwtAuthenticationResponse;
import com.stockflow.dto.response.UserProfileResponse;
import com.stockflow.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints untuk login dan me-retrieve profil pengguna")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user & dapatkan JWT Token")
    public ResponseEntity<ApiResponse<JwtAuthenticationResponse>> login(@Valid @RequestBody LoginRequest request) {
        JwtAuthenticationResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login berhasil"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get profil pengguna yang sedang terautentikasi")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser(Authentication authentication) {
        UserProfileResponse response = authService.getCurrentUserProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(response, "Profil berhasil didapatkan"));
    }
}
