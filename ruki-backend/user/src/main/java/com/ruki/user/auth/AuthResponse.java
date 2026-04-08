package com.ruki.user.auth;

import com.ruki.user.requests.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    
    private String token;
    private UserResponse user;
}