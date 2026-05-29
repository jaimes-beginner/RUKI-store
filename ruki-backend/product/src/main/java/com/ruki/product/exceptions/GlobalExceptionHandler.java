package com.ruki.product.exceptions;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException; 
import org.springframework.security.core.AuthenticationException; 
import org.springframework.validation.FieldError; 
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
        Manejo de excepciones de autenticación de Spring Security
    */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorResponse> handleSpringAuthenticationException(AuthenticationException ex) {
        log.warn("Authentication failed: {}", ex.getMessage());
        return buildResponse(HttpStatus.UNAUTHORIZED, "Autenticación fallida: " + ex.getMessage());
    }

    /*
        Manejo de nuestra excepción personalizada para autenticación
    */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiErrorResponse> handleUnauthorizedException(UnauthorizedException ex) {
        log.warn("Unauthorized access attempt: {}", ex.getMessage());
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    /*
        Manejo de nuestra excepción personalizada para recursos no encontrados
    */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    /*
        Manejo de nuestra excepción personalizada para conflictos de recursos
    */
    @ExceptionHandler(ResourceConflictException.class)
    public ResponseEntity<ApiErrorResponse> handleConflict(ResourceConflictException ex) {
        log.warn("Resource conflict: {}", ex.getMessage());
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    /*
        Manejo de nuestra excepción personalizada para operaciones prohibidas
    */
    @ExceptionHandler(ForbiddenOperationException.class)
    public ResponseEntity<ApiErrorResponse> handleForbidden(ForbiddenOperationException ex) {
        log.warn("Forbidden operation: {}", ex.getMessage());
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    /*
        Atrapa los errores de validación de los DTOs (@NotBlank, @Size)
    */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::formatFieldError)
                .collect(Collectors.joining("; "));
        log.warn("Validation error: {}", message);
        return buildResponse(HttpStatus.BAD_REQUEST, message);
    }

    /*
        Manejo de excepciones de acceso denegado de Spring Security
    */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return buildResponse(HttpStatus.FORBIDDEN, "Acceso denegado: No tienes permisos para este recurso.");
    }

    /*
        Atrapa las excepciones ResponseStatusException (ej: 404 Not Found, 409 Conflict)
    */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatusException(ResponseStatusException ex) {
        log.warn("ResponseStatusException: {} - {}", ex.getStatusCode(), ex.getReason());
        HttpStatus httpStatus = HttpStatus.resolve(ex.getStatusCode().value());
        if (httpStatus == null) {
            log.error("Could not resolve HttpStatus for status code: {}", ex.getStatusCode().value());
            return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor: " + ex.getReason());
        }
        return buildResponse(httpStatus, ex.getReason());
    }

    /*
        Atrapa cualquier otra excepción inesperada
    */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception ex) {
        log.error("An unexpected error occurred: {}", ex.getMessage(), ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor. Por favor, inténtalo de nuevo más tarde.");
    }

    private ResponseEntity<ApiErrorResponse> buildResponse(HttpStatus status, String message) {
        ApiErrorResponse response = new ApiErrorResponse(
                status.value(),
                status.getReasonPhrase(),
                message,
                LocalDateTime.now()
        );
        return ResponseEntity.status(status).body(response);
    }

    private String formatFieldError(FieldError fieldError) {
        return fieldError.getField() + ": " + fieldError.getDefaultMessage();
    }

}