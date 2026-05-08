const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://137.184.109.26:8000";

/*
	Función asincrona para poder logear a un usuario
*/
export async function loginUsuario(credenciales) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credenciales)
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Credenciales incorrectas");
    }
    return response.json(); 
}

/*
	Función asincrona para poder registrar/crear un nuevo usuario
*/
export async function registrarUsuario(userData) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/users/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Error al registrar el usuario");
    }
    return response.json();
}