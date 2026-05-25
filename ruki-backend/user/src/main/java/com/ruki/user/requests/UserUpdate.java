package com.ruki.user.requests;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdate {

    @Size(max = 255, message = "El nombre no puede exceder los 255 caracteres")
    private String firstName;

    @Size(max = 255, message = "El apellido no puede exceder los 255 caracteres")
    private String lastName;

    @Size(min = 6, max = 255, message = "La contraseña debe tener entre 6 y 255 caracteres")
    private String password;
    
}
