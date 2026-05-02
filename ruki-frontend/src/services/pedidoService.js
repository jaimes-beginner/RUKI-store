const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function getAuthHeaders() {
    const token = localStorage.getItem("ruki_token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

export async function obtenerTodosLosPedidos() {
    let response;
    try {
        response = await fetch(`${API_BASE_URL}/api-ruki/orders/admin/all`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
    } catch {
        throw new Error("No se pudo conectar con el servidor de pedidos.");
    }

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            throw new Error("No tienes permisos para ver los pedidos.");
        }
        throw new Error("No se pudo obtener la lista de pedidos.");
    }

    return response.json();
}

export async function obtenerPedidoPorId(id) {
    let response;
    try {
        response = await fetch(`${API_BASE_URL}/api-ruki/orders/${id}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
    } catch {
        throw new Error("No se pudo conectar con el servidor de pedidos.");
    }

    if (!response.ok) {
        const error = new Error("No se pudo obtener el pedido.");
        error.status = response.status;
        throw error;
    }

    return response.json();
}
