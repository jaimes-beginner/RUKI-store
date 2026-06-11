import api from '@/config/api';

/*----------------------------------*/
/*             CLIENTE              */
/*----------------------------------*/

// FUNCIÓN PARA OBTENER LOS PRODUCTOS ACTIVOS CON PAGINACIÓN
export const obtenerProductosActivos = (page = 0, size = 6) => api.get(`/products/active?page=${page}&size=${size}`);

// FUNCIÓN PARA OBTENER LOS NUEVOS PRODUCTOS CON PAGINACIÓN
export const obtenerNewArrivals = (page = 0, size = 6) => api.get(`/products/new-arrivals?page=${page}&size=${size}`);

// FUNCIÓN PARA OBTENER LOS PRODUCTOS EN OFERTA CON PAGINACIÓN
export const obtenerOfertas = (page = 0, size = 6) => api.get(`/products/sale?page=${page}&size=${size}`);

// FUNCIÓN PARA OBTENER UN PRODUCTO POR SU ID
export const obtenerProductoPorId = (id) => api.get(`/products/${id}`);

// FUNCIÓN PARA OBTENER LOS PRODUCTOS DE UNA CATEGORÍA ESPECÍFICA
export const obtenerProductosPorCategoria = (categoryId) => api.get(`/products/category/${categoryId}`);

// FUNCIÓN PARA OBTENER LAS CATEGORÍAS ACTIVAS
export const obtenerCategoriasActivas = () => api.get('/categories/active');

// FUNCIÓN PARA OBTENER UNA CATEGORÍA POR SU ID
export const obtenerCategoriaPorId = (id) => api.get(`/categories/${id}`);

// FUNCIÓN PARA FILTRAR PRODUCTOS CON VARIOS CRITERIOS Y PAGINACIÓN
export const filtrarProductos = (filtros = {}, page = 0, size = 12) => {
    const params = new URLSearchParams({ page, sizePage: size });
    Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== '') params.append(key, value);
    });
    return api.get(`/products/filter?${params.toString()}`);
};

/*----------------------------------*/
/*          ADMINISTRADOR           */
/*----------------------------------*/

// FUNCIÓN PARA CREAR UN NUEVO PRODUCTO
export const crearProducto = (productData) => api.post('/products/create', productData);

// FUNCIÓN PARA ACTUALIZAR UN PRODUCTO EXISTENTE
export const actualizarProducto = (id, productData) => api.put(`/products/update/${id}`, productData);

// FUNCIÓN PARA DESACTIVAR UN PRODUCTO (SOFT DELETE)
export const desactivarProducto = (id) => api.put(`/products/delete/${id}`);

// FUNCIÓN PARA OBTENER TODOS LOS PRODUCTOS (INCLUYENDO LOS DESACTIVADOS) PARA ADMIN
export const obtenerTodosLosProductosAdmin = () => api.get('/products/admin/all');

// FUNCIÓN PARA OBTENER LOS PRODUCTOS ADMIN CON PAGINACIÓN
export const obtenerProductosAdminPaginados = (page = 0, size = 10) => api.get(`/products/admin/paged?page=${page}&sizePage=${size}`);

// FUNCIÓN PARA REACTIVAR UN PRODUCTO DESACTIVADO
export const reactivarProducto = (id) => api.put(`/products/reactivate/${id}`);

// FUNCIÓN PARA CREAR UNA NUEVA CATEGORÍA
export const crearCategoria = (categoryData) => api.post('/categories/create', categoryData);

// FUNCIÓN PARA DESACTIVAR UNA CATEGORÍA (SOFT DELETE)
export const desactivarCategoria = (id) => api.put(`/categories/delete/${id}`);
