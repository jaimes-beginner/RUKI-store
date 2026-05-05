import apiClient from './apiClient';

export async function obtenerTodosLosPedidos() {
    try {
        const response = await apiClient.get('/api-ruki/orders/admin/all');
        return response.data;
    } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error("No tienes permisos para ver los pedidos.");
        }
        const message = error.response?.data?.message || "No se pudo obtener la lista de pedidos.";
        throw new Error(message);
    }
}

export async function obtenerPedidoPorId(id) {
    try {
        const response = await apiClient.get(`/api-ruki/orders/${id}`);
        return response.data;
    } catch (error) {
        const err = new Error("No se pudo obtener el pedido.");
        err.status = error.response?.status;
        throw err;
    }
}
