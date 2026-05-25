package com.ruki.user.auth;

import com.ruki.user.requests.UserResponse;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AuthResponse {
    
    private String token;
    private UserResponse user;

}