import { createContext, useContext, useMemo, useState } from "react";
import { loginUsuario as loginService } from "@/services/AuthService";

const TOKEN_KEY = "ruki_token";
const USER_KEY = "ruki_usuario";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [usuario, setUsuario] = useState(() => {
        const savedUser = localStorage.getItem(USER_KEY);
        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            localStorage.removeItem(USER_KEY);
            return null;
        }
    });

    async function login(correo, password) {

		// AXIOS YA MANEJA EL ERROR Y EL PARSEO
        const data = await loginService({ email: correo, password });
        
        const backendUser = data?.user || {};
        const userRole = backendUser?.role || "CUSTOMER";
        
        const normalizedUser = {
            id: backendUser?.id ?? null,
            email: backendUser?.email ?? correo,
            nombreUsuario: backendUser?.firstName || "",
            firstName: backendUser?.firstName || "",
            lastName: backendUser?.lastName || "",
            role: userRole,
            rol: userRole === "ADMIN" ? 1 : 2,
        };

        const authToken = data?.token || null;
        if (authToken) {
            localStorage.setItem(TOKEN_KEY, authToken);
            setToken(authToken);
        }
        
        localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
        setUsuario(normalizedUser);

        return normalizedUser;
    }

    function logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUsuario(null);
    }

    const value = useMemo(() => ({
        token,
        usuario,
        isAuthenticated: Boolean(token),
        login,
        logout,
    }), [token, usuario]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return context;
}