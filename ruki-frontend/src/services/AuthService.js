const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function registrarUsuario(payload) {
	const response = await fetch(`${API_BASE_URL}/api-ruki/users/create`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		let message = "No se pudo crear el usuario.";
		try {
			const data = await response.json();
			message = data?.message || data?.error || message;
		} catch {
			// Ignora errores de parseo y usa el mensaje por defecto.
		}
		throw new Error(message);
	}

	return response.json();
}
