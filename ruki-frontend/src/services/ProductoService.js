import apiClient from './apiClient';

export async function obtenerProductos() {
    try {
        const response = await apiClient.get('/api-ruki/products/active');
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || "No se pudo obtener el inventario de productos.";
        throw new Error(message);
    }
}
