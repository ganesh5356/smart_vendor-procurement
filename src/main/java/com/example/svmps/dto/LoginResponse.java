package com.example.svmps.dto;

import java.time.Instant;

public class LoginResponse {

    private String token;
    private Instant expiresAt;
    private Long userId;

    public LoginResponse() {}

    public LoginResponse(String token, Instant expiresAt, Long userId) {
        this.token = token;
        this.expiresAt = expiresAt;
        this.userId = userId;
    }

    public String getToken() {
        return token;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Long getUserId() {
        return userId;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
