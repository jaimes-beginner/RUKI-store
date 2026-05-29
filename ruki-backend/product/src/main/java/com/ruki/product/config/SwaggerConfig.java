package com.ruki.product.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server; 
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "RUKI Microservices - Product Service",
        description = "Documentación de la API del Microservicio de Productos, incluyendo gestión de catálogo, inventario y filtros.", // Descripción más detallada
        version = "1.0.0"
    ),
    security = @SecurityRequirement(name = "bearerAuth"),
    servers = { 
        @Server(url = "/", description = "Gateway base URL"),
        @Server(url = "http://localhost:8081", description = "Local Development Server") 
        
        /*
            Se puede añadir más servidores para staging, producción, etc...
        */
    }
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "Introduce tu token JWT aquí (ej. Bearer eyJ...)"
)
public class SwaggerConfig {
}