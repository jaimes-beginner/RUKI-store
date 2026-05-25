package com.ruki.user.config;

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
        title = "RUKI Microservices - User Service", 
        description = "Documentación de la API del Microservicio de Usuarios, incluyendo autenticación JWT y gestión de perfiles/direcciones.",
        version = "1.0.0"
    ),
    security = @SecurityRequirement(name = "bearerAuth"),
    servers = { // Definir servidores directamente en @OpenAPIDefinition
        @Server(url = "/", description = "Default Server URL"),
        @Server(url = "http://localhost:8080", description = "Local Development Server") // Ejemplo de servidor local
        
        /*
            Se pueden ir agregando más servidores 
            para staging, producción, etc...
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