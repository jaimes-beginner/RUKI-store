package com.ruki.order.exceptions;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {

    /* 
        Esta clase representa la estructura de datos que 
        se va a enviar en el cuerpo de la respuesta (response) 
        cuando ocurra un error en la API; cuando falló, el 
        estado, el mensaje, la ruta, etc. Esto es útil para 
        que el cliente
    */

    private LocalDateTime timestamp;  
    private int status;              
    private String error;           
    private String message;           
    private String path;  
               
}