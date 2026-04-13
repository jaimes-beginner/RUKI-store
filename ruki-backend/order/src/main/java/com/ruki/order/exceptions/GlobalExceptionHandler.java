package com.ruki.order.exceptions;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

   /* 
        Esto atrapa los errores que nosotros lanzamos 
        a propósito con ResponseStatusException
   */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(ResponseStatusException ex, HttpServletRequest request) {
        
        log.warn("ALERTA DE SEGURIDAD (403): Intento de acceso denegado a la ruta {}", request.getRequestURI());

        ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(),
                ex.getStatusCode().value(),
                HttpStatus.valueOf(ex.getStatusCode().value()).getReasonPhrase(),
                ex.getReason(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(error, ex.getStatusCode());
    }

    /* 
        Esto atrapa todos los bloques de seguridad en el sistema
    */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.FORBIDDEN.value(),
                HttpStatus.FORBIDDEN.getReasonPhrase(),
                "Acceso denegado: No tienes los permisos necesarios para realizar esta acción.",
                request.getRequestURI()
        );
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    /* 
        Esto atrapa todos los errores de validación que ocurren cuando un 
        cliente envía datos que no cumplen con las reglas definidas en los DTOs
    */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        
        /* 
            Como adición, esto junta todos los campos que 
            fallaron en un solo String fácil de leer
        */
        String errorMessages = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .collect(Collectors.joining(", "));

        ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                errorMessages,
                request.getRequestURI()
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /* 
        Esto es el fallback de seguridad, o sea, si algo explota feo en 
        Java, lo atrapamos aquí y NO le mostramos los detalles técnicos 
        al usuario para evitar hackeos exponienodo datos
    */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, HttpServletRequest request) {
        
        ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                "Ocurrió un error inesperado en el servidor. Por favor, contacte a soporte.", // Mensaje genérico y seguro
                request.getRequestURI()
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
}