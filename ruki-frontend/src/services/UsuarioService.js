import api from '@/config/api';

/*----------------------------------*/
/*             CLIENTE              */
/*----------------------------------*/

// FUNCIÓN PARA CREAR UN NUEVO USUARIO
export const crearUsuario = (userData) => api.post('/users/create', userData);

// FUNCIÓN PARA OBTENER EL PERFIL DEL USUARIO AUTENTICADO
export const obtenerMiPerfil = () => api.get('/users/me');

// FUNCIÓN PARA OBTENER UN USUARIO POR SU ID
export const obtenerUsuarioPorId = (id) => api.get(`/users/${id}`);

// FUNCIÓN PARA OBTENER UN USUARIO POR SU EMAIL
export const obtenerUsuarioPorEmail = (email) => api.get(`/users/email/${email}`);

// FUNCIÓN PARA ACTUALIZAR LOS DATOS DE UN USUARIO
export const actualizarUsuario = (id, userData) => api.put(`/users/update/${id}`, userData);

// FUNCIÓN PARA ELIMINAR UN USUARIO (SOFT DELETE)
export const eliminarUsuario = (id) => api.put(`/users/delete/${id}`);

// FUNCIÓN PARA CREAR UNA DIRECCIÓN
export const crearDireccion = (addressData) => api.post('/addresses/create', addressData);

// FUNCIÓN PARA OBTENER LAS DIRECCIONES DE UN USUARIO
export const obtenerDireccionesPorUsuario = (userId) => api.get(`/addresses/user/${userId}`);

// FUNCIÓN PARA OBTENER LAS DIRECCIONES ACTIVAS DE UN USUARIO
export const obtenerDireccionesActivasPorUsuario = (userId) => api.get(`/addresses/user/${userId}/active`);

// FUNCIÓN PARA ACTUALIZAR UNA DIRECCIÓN
export const actualizarDireccion = (addressId, addressData) => api.put(`/addresses/update/${addressId}`, addressData);

/*----------------------------------*/
/*          ADMINISTRADOR           */
/*----------------------------------*/

// FUNCIÓN PARA OBTENER LOS USUARIOS ACTIVOS CON PAGINACIÓN
export const obtenerUsuariosActivos = (page = 0, size = 9) => api.get(`/users/active?page=${page}&size=${size}`);

// FUNCIÓN PARA OBTENER TODOS LOS USUARIOS CON PAGINACIÓN
export const obtenerUsuarios = () => api.get('/users/admin/all');

// FUNCIÓN PARA OBTENER LOS USUARIOS CON PAGINACIÓN PARA ADMIN
export const obtenerUsuariosPaginados = (page = 0, size = 9) => api.get(`/users/admin/paged?page=${page}&size=${size}`);

// FUNCIÓN PARA REACTIVAR UN USUARIO DESACTIVADO
export const reactivarUsuario = (id) => api.put(`/users/reactivate/${id}`);

// FUNCIÓN PARA OBTENER TODAS LAS DIRECCIONES (INCLUYENDO LAS DESACTIVADAS) PARA ADMIN
export const obtenerTodasLasDirecciones = () => api.get('/addresses/admin/all');

// FUNCIÓN PARA ELIMINAR UNA DIRECCIÓN (SOFT DELETE)
export const eliminarDireccion = (addressId) => api.put(`/addresses/delete/${addressId}`);
