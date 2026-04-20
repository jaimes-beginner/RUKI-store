package com.ruki.payment.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignConfig implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {

        /* 
            Atrapamos la petición actual
        */
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();

            /* 
                Ahora traemos el header "Authorization" que trae el bearer
            */
            String authHeader = request.getHeader("Authorization");
            
            /* 
                En caso de que exista, lo ponemos en el Feign
            */
            if (authHeader != null) {
                template.header("Authorization", authHeader);
            }
        }
    }
    
}