const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://137.184.109.26:8000";

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
