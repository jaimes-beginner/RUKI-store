package com.ruki.product.exceptions;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

public record ApiErrorResponse(
        int status,
        String error,
        String message,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime timestamp
) {
    
}