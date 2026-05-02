const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function getAuthHeaders() {
    const token = localStorage.getItem("ruki_token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

export async function obtenerUsuarios() {
    let response;
    try {
        response = await fetch(`${API_BASE_URL}/api-ruki/users/admin/all`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
    } catch {
        throw new Error("No se pudo conectar con el servidor de usuarios.");
    }

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            throw new Error("No tienes permisos para ver todos los usuarios.");
        }
        throw new Error("No se pudo obtener la lista de usuarios.");
    }

    return response.json();
}
