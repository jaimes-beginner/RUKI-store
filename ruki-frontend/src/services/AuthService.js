import apiClient from './apiClient';

export async function registrarUsuario(payload) {
	try {
		const response = await apiClient.post('/api-ruki/users/create', payload);
		return response.data;
	} catch (error) {
		let message = "No se pudo crear el usuario.";
		if (error.response?.data?.message || error.response?.data?.error) {
			message = error.response.data.message || error.response.data.error;
		} else if (error.message) {
			message = error.message;
		}
		throw new Error(message);
	}
}
