const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://137.184.109.26:8000";

const getToken = () => localStorage.getItem("ruki_token");

/*=========================================*/
/* ENDPOINTS PÚBLICOS (CLIENTES)           */
/*=========================================*/

/*
    Función asíncrona para obtener el 
    catálogo de productos activos
*/
export async function obtenerProductosActivos() {
    const response = await fetch(`${API_BASE_URL}/api-ruki/products/active`);
    if (!response.ok) throw new Error("Error al obtener el catálogo de productos");
    return response.json();
}

/*
    Función asíncrona para obtener 
    un producto por su ID
*/
export async function obtenerProductoPorId(id) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/products/${id}`);
    if (!response.ok) throw new Error("Producto no encontrado");
    return response.json();
}

/*
    Función asíncrona para obtener los 
    productos de una categoría específica
*/
export async function obtenerProductosPorCategoria(categoryId) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/products/category/${categoryId}`);
    if (!response.ok) throw new Error("Error al obtener los productos de esta categoría");
    return response.json();
}

/*
    Función asíncrona para obtener los 
    últimos lanzamientos en productos
*/
export async function obtenerNewArrivals() {
    const response = await fetch(`${API_BASE_URL}/api-ruki/products/new-arrivals`);
    if (!response.ok) throw new Error("Error al obtener los últimos lanzamientos");
    return response.json();
}

/*  
    Función asíncrona para obtener los 
    productos en oferta (descuento activo)
*/
export async function obtenerOfertas() {
    const response = await fetch(`${API_BASE_URL}/api-ruki/products/sale`);
    if (!response.ok) throw new Error("Error al obtener las ofertas");
    return response.json();
}

/*
    Función asíncrona para filtrar productos dinamicamente
    por categoría, talla, rango de precio y ordenamiento
*/
export async function filtrarProductos(filtros = {}) {
    const params = new URLSearchParams();
    
    if (filtros.categoryId) params.append("categoryId", filtros.categoryId);
    if (filtros.size) params.append("size", filtros.size);
    if (filtros.minPrice) params.append("minPrice", filtros.minPrice);
    if (filtros.maxPrice) params.append("maxPrice", filtros.maxPrice);
    if (filtros.sort) params.append("sort", filtros.sort); // newest, priceAsc, priceDesc

    const queryString = params.toString();
    const url = `${API_BASE_URL}/api-ruki/products/filter${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al filtrar los productos");
    return response.json();
}


/*=========================================*/
/* ENDPOINTS PRIVADOS (ADMINISTRADOR)      */
/*=========================================*/

/*
    Función asíncrona para crear un nuevo producto
*/
export async function crearProducto(productData) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/products/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || err.error || "Error al crear el producto");
    }
    return response.json();
}

/*
    Función asíncrona para actualizar u
    n producto existente
*/
export async function actualizarProducto(id, productData) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/products/update/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || err.error || "Error al actualizar el producto");
    }
    return response.json();
}

/*
    Función asíncrona para desactivar 
    un producto (soft delete)
*/
export async function desactivarProducto(id) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/products/delete/${id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error("Error al desactivar el producto");
    return true;
}

/*=========================================*/
/* ENDPOINTS PÚBLICOS (CLIENTES)           */
/*=========================================*/

/*
    Función asíncrona para obtener todas las 
    categorías activas para el catálogo
*/
export async function obtenerCategoriasActivas() {
    const response = await fetch(`${API_BASE_URL}/api-ruki/categories/active`);
    if (!response.ok) throw new Error("Error al obtener las categorías");
    return response.json();
}

/*
    Función asíncrona para obtener una 
    categoría específica por su ID
*/
export async function obtenerCategoriaPorId(id) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/categories/${id}`);
    if (!response.ok) throw new Error("Categoría no encontrada");
    return response.json();
}

/*=========================================*/
/* ENDPOINTS PRIVADOS (ADMINISTRADOR)      */
/*=========================================*/

/*
    Función asíncrona para que el administrador 
    cree una nueva categoría
*/
export async function crearCategoria(categoryData) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/categories/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || err.error || "Error al crear la categoría");
    }
    return response.json();
}

/*
    Función asíncrona para realizar una baja lógica 
    (desactivar) de una categoría
*/
export async function desactivarCategoria(id) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/categories/delete/${id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    
    if (!response.ok) throw new Error("Error al desactivar la categoría");
    return true; 
}