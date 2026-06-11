import axios from 'axios';

// OBTENEMOS LA URL BASE
let envBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://137.184.109.26:8000";

// SIEMPRE DEBE TERMINAR ASÍ LA URL, ASÍ ESTÁ EN EL BACKEND
if (!envBaseUrl.endsWith('/api-ruki')) {
    envBaseUrl += '/api-ruki';
}

// CREANDO INSTANCIA CON LA URL
const api = axios.create({
    baseURL: envBaseUrl,
    headers: {
        'Content-Type': 'application/json'
    }
});

// INTERCEPTOR DE PETICIÓN (Inyecta el Token JWT)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('ruki_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// INTERCEPTOR DE RESPUESTA
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message 
                     || error.response?.data?.error 
                     || error.message 
                     || "Error de conexión con el servidor";
        return Promise.reject(new Error(message));
    }
);

export default api;