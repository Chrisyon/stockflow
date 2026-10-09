package com.stockflow.service;

import com.stockflow.dto.request.LoginRequest;
import com.stockflow.dto.response.JwtAuthenticationResponse;
import com.stockflow.dto.response.UserProfileResponse;

public interface AuthService {

    JwtAuthenticationResponse login(LoginRequest request);

    UserProfileResponse getCurrentUserProfile(String username);
}
