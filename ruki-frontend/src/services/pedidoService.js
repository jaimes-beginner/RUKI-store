const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://137.184.109.26:8000";

const getToken = () => localStorage.getItem("ruki_token");

/*===============================*/
/* ENDPOINTS DEL CLIENTE */
/*===============================*/

/*
    Función asincrona para 
    crear un nuevo pedido
*/
export async function crearPedido(orderData) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/orders/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(orderData),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Error al generar el pedido");
    }
    return response.json();
}

/*
    Función asincrona para iniciar el pago con Stripe
*/
export async function iniciarPagoStripe(orderId) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api-ruki/payments/create?orderId=${orderId}`, {
        method: "POST", headers: {"Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al conectar con la pasarela de pagos");
    }
    
    return response.json(); 
}

/*
    Función asincrona para obtener el 
    historial de pedidos del usuario logueado
*/
export async function obtenerMisPedidos() {
    const response = await fetch(`${API_BASE_URL}/api-ruki/orders/me`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error("Error al obtener tu historial de pedidos");
    return response.json();
}

/*
    Función asincrona para obtener el detalle de 
    un pedido específico, solo si pertenece al usuario 
    logueado o si el usuario es ADMIN
*/
export async function obtenerPedidoPorId(id) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/orders/${id}`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error(response.status === 404 ? "Pedido no encontrado" : "Acceso denegado a este pedido");
    return response.json();
}

/*
    Función asincrona para cancelar un pedido 
    específico del usuario logueado.
*/
export async function cancelarMiPedido(id) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/orders/me/${id}/cancel`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error("Error al cancelar el pedido. Puede que ya esté en camino.");
    return response.json();
}

/*===============================*/
/* ENDPOINTS DEL ADMINISTRADOR */
/*===============================*/

/*
    Función asincrona para obtener 
    todos los pedidos
*/
export async function obtenerTodosLosPedidos() {
    const response = await fetch(`${API_BASE_URL}/api-ruki/orders/admin/all`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error("No tienes permisos o hubo un error al obtener pedidos");
    return response.json();
}

/*
    Función asincrona para actualizar 
    el estado de un pedido específico
*/
export async function actualizarEstadoPedido(id, status) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/orders/admin/${id}/status?status=${status}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error("Error al actualizar el estado del pedido");
    return response.json();
}
