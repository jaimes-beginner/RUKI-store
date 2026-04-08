package com.ruki.user.requests;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdate {

    /* 
        Aquí van los datos que el usuario se 
        puede modificar/actualizar actualmente
    */

    private String firstName;   
    private String lastName;  
    private String password;   

}
