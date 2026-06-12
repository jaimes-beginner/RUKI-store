import api from '@/config/api';

/*----------------------------------*/
/*             CLIENTE              */
/*----------------------------------*/
/*----------------------------------*/
/*          ADMINISTRADOR           */
/*----------------------------------*/

// FUNCIÓN PARA LOGEAR UN USUARIO
export const loginUsuario = (credenciales) => api.post('/auth/login', credenciales);

// FUNCIÓN PARA CREAR UN USUARIO
export const registrarUsuario = (userData) => api.post('/users/create', userData);

// FUNCIÓN PARA RECUPERAR CONSTRASEÑA OLVIDADA
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });

// FUNCIÓN PARA RESETEAR LA CONTRASEÑA
export const resetPassword = (token, newPassword) => api.post('/auth/reset-password', { token, newPassword });
