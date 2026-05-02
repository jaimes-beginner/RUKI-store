const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function obtenerProductos() {
    let response;
    try {
        response = await fetch(`${API_BASE_URL}/api-ruki/products/active`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch {
        throw new Error("No se pudo conectar con el servidor de productos.");
    }

    if (!response.ok) {
        throw new Error("No se pudo obtener el inventario de productos.");
    }

    return response.json();
}
