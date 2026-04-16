package com.ruki.product.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /*
        Atrapa las excepciones ResponseStatusException (ej: 404 Not Found, 409 Conflict)
        y las formatea en un JSON limpio y estandarizado.
    */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
        
        log.error("AUDITORÍA DE ERROR [ResponseStatusException]: Status {} - Razón: {}", ex.getStatusCode(), ex.getReason(), ex);
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("status", ex.getStatusCode().value());
        errorResponse.put("error", ex.getReason());
        errorResponse.put("timestamp", LocalDateTime.now().toString());
        
        return new ResponseEntity<>(errorResponse, ex.getStatusCode());
    }

    /*
        Atrapa los errores de validación de los DTOs (@NotBlank, @Size)
        y devuelve solo el primer mensaje de error para no saturar al frontend.
    */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        
        log.error("AUDITORÍA DE ERROR [Validación de DTO]: Se recibieron datos incorrectos en el JSON.");

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
        
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Error de validación en los datos enviados");
                
        errorResponse.put("error", errorMessage);
        errorResponse.put("timestamp", LocalDateTime.now().toString());

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
    
    /*
        Atrapa nuestros errores manuales genéricos
        y los devuelve como 400 Bad Request
    */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        
        log.error("AUDITORÍA DE ERROR CRÍTICO [Excepción Global]: Ocurrió un fallo no controlado.", ex);
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
        errorResponse.put("error", ex.getMessage());
        errorResponse.put("timestamp", LocalDateTime.now().toString());
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
}