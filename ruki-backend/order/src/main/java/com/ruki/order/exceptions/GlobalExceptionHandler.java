package com.ruki.order.exceptions;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException; 
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

/*
    Cuando algo sale mal en cualquier parte de los controladores o servicios,
    este guardián lo atrapa y se asegura de que el cliente reciba una respuesta
    de error bonita y fácil de entender, en lugar de un mensaje técnico confuso
*/
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /*
        Maneja los errores de autenticación que Spring Security lanza
        Por ejemplo, si alguien intenta acceder a una ruta protegida sin un token válido
    */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleSpringAuthenticationException(AuthenticationException ex, HttpServletRequest request) {
        log.warn("AUDITORÍA DE SEGURIDAD (401): Intento de autenticación fallida a {} - {}", request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.UNAUTHORIZED, "Autenticación fallida: Token inválido o no proporcionado.", request.getRequestURI());
    }

    /*
        Maneja nuestra excepción personalizada para cuando un usuario
        intenta hacer algo sin los permisos adecuados (ej: un cliente
        intentando acceder a una función de administrador)
    */
    @ExceptionHandler(UnauthorizedException.class) 
    public ResponseEntity<ErrorResponse> handleUnauthorizedException(UnauthorizedException ex, HttpServletRequest request) {
        log.warn("AUDITORÍA DE SEGURIDAD (401): Acceso no autorizado a {} - {}", request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), request.getRequestURI());
    }

    /*
        Maneja nuestra excepción personalizada para cuando se busca
        un recurso (como un pedido o un producto) que no existe
    */
    @ExceptionHandler(ResourceNotFoundException.class) 
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        log.warn("RECURSO NO ENCONTRADO (404): {} en la ruta {}", ex.getMessage(), request.getRequestURI());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI());
    }

    /*
        Maneja nuestra excepción personalizada para cuando hay un conflicto
        con el estado actual de un recurso (ej: intentar cancelar un pedido
        que ya fue entregado)
    */
    @ExceptionHandler(ResourceConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(ResourceConflictException ex, HttpServletRequest request) {
        log.warn("CONFLICTO DE RECURSO (409): {} en la ruta {}", ex.getMessage(), request.getRequestURI());
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI());
    }

    /*
        Maneja nuestra excepción personalizada para cuando un usuario
        intenta realizar una operación que está prohibida para él,
        incluso si está autenticado (ej: un cliente intentando modificar
        un pedido de otro cliente)
    */
    @ExceptionHandler(ForbiddenOperationException.class) 
    public ResponseEntity<ErrorResponse> handleForbidden(ForbiddenOperationException ex, HttpServletRequest request) {
        log.warn("OPERACIÓN PROHIBIDA (403): {} en la ruta {}", ex.getMessage(), request.getRequestURI());
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage(), request.getRequestURI());
    }

    /*
        Esto atrapa los errores que nosotros lanzamos
        a propósito con ResponseStatusException
    */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(ResponseStatusException ex, HttpServletRequest request) {
        log.warn("ALERTA DE SEGURIDAD ({}): {} en la ruta {}", ex.getStatusCode().value(), ex.getReason(), request.getRequestURI());
        
        /*
            Convertir HttpStatusCode a HttpStatus antes de pasarlo a buildResponse.
            Esto es necesario porque ResponseStatusException puede devolver un HttpStatusCode
            que no siempre es directamente un HttpStatus estándar, y nuestro buildResponse
            espera un HttpStatus
        */
        HttpStatus httpStatus = HttpStatus.resolve(ex.getStatusCode().value());
        if (httpStatus == null) {
            log.error("ERROR INTERNO: No se pudo resolver HttpStatus para el código de estado: {}", ex.getStatusCode().value());
            return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor: " + ex.getReason(), request.getRequestURI());
        }
        return buildResponse(httpStatus, ex.getReason(), request.getRequestURI());
    }

    /*
        Esto atrapa todos los bloques de seguridad en el sistema
        cuando un usuario no tiene el rol adecuado para acceder a un recurso
    */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex, HttpServletRequest request) {
        log.warn("AUDITORÍA DE SEGURIDAD (403): Acceso denegado a {} - {}", request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.FORBIDDEN, "Acceso denegado: No tienes los permisos necesarios para realizar esta acción.", request.getRequestURI());
    }

    /*
        Esto atrapa todos los errores de validación que ocurren cuando un
        cliente envía datos que no cumplen con las reglas definidas en los DTOs
        (ej: un campo obligatorio vacío, una contraseña muy corta)
    */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        
        /*
            Junta todos los campos que fallaron en un solo String fácil de leer
            Por ejemplo: "email: El correo es obligatorio, password: La contraseña es obligatoria"
        */
        String errorMessages = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .collect(Collectors.joining(", "));

        log.warn("ERROR DE VALIDACIÓN (400): {} en la ruta {}", errorMessages, request.getRequestURI());
        return buildResponse(HttpStatus.BAD_REQUEST, errorMessages, request.getRequestURI());
    }

    /*
        Esto es el "paracaídas" de seguridad. Si algo explota feo en
        Java y no lo atrapamos con un ExceptionHandler más específico,
        este lo atrapa. NO le mostramos los detalles técnicos
        al usuario para evitar exponer información sensible.
    */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, HttpServletRequest request) {
        log.error("ERROR INESPERADO (500): {} en la ruta {}", ex.getMessage(), request.getRequestURI(), ex); /* Loguear la stack trace */
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error inesperado en el servidor. Por favor, inténtalo de nuevo más tarde.", request.getRequestURI());
    }

    /*
        Método auxiliar para construir una respuesta de error estandarizada.
    */
    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message, String path) {
        ErrorResponse error = ErrorResponse.builder() 
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(path)
                .build();
        return new ResponseEntity<>(error, status);
    }
    
}