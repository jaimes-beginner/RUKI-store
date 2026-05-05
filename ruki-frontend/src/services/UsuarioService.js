import apiClient from './apiClient';

export async function obtenerUsuarios() {
    try {
        const response = await apiClient.get('/api-ruki/users/admin/all');
        return response.data;
    } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error("No tienes permisos para ver todos los usuarios.");
        }
        const message = error.response?.data?.message || "No se pudo obtener la lista de usuarios.";
        throw new Error(message);
    }
}
