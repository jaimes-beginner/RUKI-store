// Importaciones
import axios from 'axios';

// Creamos la instancia central de Axios
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
});

/*---------------------------------------*/ 

// Interceptor que se ejecuta ANTES de CUALQUIER petición
apiClient.interceptors.request.use(
    (config) => {
        // Obtiene el token del localStorage
        const token = localStorage.getItem('tokenRUKI');
        
        // Si el token existe, lo añade al encabezado
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;