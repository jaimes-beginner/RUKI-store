package com.ruki.user.requests;

import com.ruki.user.entities.Role;
import lombok.Builder;
import lombok.Value; 
import java.time.LocalDateTime;

@Value 
@Builder 
public class UserResponse {

    Long id;
    String email;
    String firstName;
    String lastName;
    Role role;
    LocalDateTime createdAt;
    
}