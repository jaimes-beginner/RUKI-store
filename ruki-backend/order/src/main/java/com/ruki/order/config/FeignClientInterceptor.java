package com.ruki.order.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class FeignClientInterceptor implements RequestInterceptor {

    /*
        Este interceptor se ejecuta milisegundos antes de que 
        FeignClient haga la llamada hacia otro microservicio
    */
    @Override
    public void apply(RequestTemplate template) {
        
        /* 
            Agarramos la petición web actual (actualmente estamos usando 
            postman, así que de ahí vienen todas estas pruebas)
        */
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            
            /* 
                Extraemos el encabezado de 
                Autorización (o sea el token)
            */
            String authHeader = request.getHeader("Authorization");
            
            /* 
                Si el token existe, entonces se lo 
                inyectmos a la llamada de Feign
            */
            if (authHeader != null) {
                template.header("Authorization", authHeader);
            }
        }
    }
    
}