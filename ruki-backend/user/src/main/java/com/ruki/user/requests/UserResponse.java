package com.ruki.user.requests;

import com.ruki.user.entities.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    /*
        Este es el formato que va a tener la respuesta del
        usuario, los datos que devolverá para una respuesta 
        mas limpia, sin mostrar la constraseña aunque esté hasheada
    */

    private Long id;                    
    private String email;             
    private String firstName;       
    private String lastName;          
    private Role role;                 
    private LocalDateTime createdAt;    

}
