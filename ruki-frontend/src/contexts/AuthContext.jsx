import { createContext, useContext, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const TOKEN_KEY = "ruki_token";
const USER_KEY = "ruki_usuario";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
	const [usuario, setUsuario] = useState(() => {
		const savedUser = localStorage.getItem(USER_KEY);
		if (!savedUser) {
			return null;
		}
		try {
			return JSON.parse(savedUser);
		} catch {
			localStorage.removeItem(USER_KEY);
			return null;
		}
	});

	async function login(correo, password) {
		const response = await fetch(`${API_BASE_URL}/api-ruki/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email: correo, password }),
		});

		if (!response.ok) {
			let message = "Correo o contrasena incorrectos.";
			try {
				const data = await response.json();
				message = data?.message || data?.error || message;
			} catch {
				// Ignora errores de parseo y conserva el mensaje por defecto.
			}
			throw new Error(message);
		}

		const data = await response.json();
		const backendUser = data?.user || data?.usuario || {};
		const userRole = backendUser?.role || "CUSTOMER";
		const normalizedUser = {
			id: backendUser?.id ?? null,
			email: backendUser?.email ?? correo,
			nombreUsuario: backendUser?.firstName || backendUser?.nombreUsuario || "",
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

	const value = useMemo(
		() => ({
			token,
			usuario,
			isAuthenticated: Boolean(token),
			login,
			logout,
		}),
		[token, usuario],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth debe usarse dentro de AuthProvider");
	}
	return context;
}
