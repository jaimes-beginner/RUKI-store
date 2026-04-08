package com.ruki.user.auth;

import com.ruki.user.security.JwtUtils;
import com.ruki.user.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;
    private final UserService userService;

    public AuthResponse login(AuthRequest request) {
        
        /*
            Aquí Spring Security valida si el 
            correo y la contraseña son correctos
        */
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        /*
            Si pasamos el paso anterior, entonces 
            buscamos el perfil oficial para el token
        */
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());

        /*
            Generamos el Token JWT firmado
        */
        String token = jwtUtils.generateToken(userDetails);

        /*
            Buscamos el DTO/Response seguro del 
            usuario para mandarlo al frontend
        */
        var userResponse = userService.getUserByEmail(request.getEmail());

        /*
            Entregamos el paquete completo, con 
            el token y los datos del usuario
        */
        return new AuthResponse(token, userResponse);
    }
}