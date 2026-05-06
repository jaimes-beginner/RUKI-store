/*
    Apuntamos directamente a tu 
    API Gateway en DigitalOcean
*/
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://137.184.109.26:8000";

/*
    Función auxiliar para obtener 
    el token del localStorage
*/
const getToken = () => localStorage.getItem("ruki_token");

/*===============================*/
/* ENDPOINTS PÚBLICOS */
/*===============================*/

/*
    Función asincrona para obtener 
    todas las categorías activas
*/
export async function obtenerCategoriasActivas() {
    const response = await fetch(`${API_BASE_URL}/api-ruki/categories/active`);
    if (!response.ok) throw new Error("Error al cargar categorías");
    return response.json();
}

/*
    Función asincrona para obtener 
    una categoría específica por su ID
*/
export async function obtenerCategoriaPorId(id) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/categories/${id}`);
    if (!response.ok) throw new Error("Categoría no encontrada");
    return response.json();
}

/*
    Función asincrona para obtener 
    todos los productos activos
*/
export async function obtenerProductosActivos() {
    const response = await fetch(`${API_BASE_URL}/api-ruki/products/active`);
    if (!response.ok) throw new Error("Error al cargar productos");
    return response.json();
}

/*
    Función asincrona para obtener un 
    producto específico por su ID
*/
export async function obtenerProductoPorId(id) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/products/${id}`);
    if (!response.ok) throw new Error("Producto no encontrado");
    return response.json();
}

/*
    Función asincrona para obtener 
    productos según su categoría
*/
export async function obtenerProductosPorCategoria(categoryId) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/products/category/${categoryId}`);
    if (!response.ok) throw new Error("Error al cargar productos de esta categoría");
    return response.json();
}


/*===============================*/
/* ENDPOINTS PRIVADOS */
/*===============================*/

/*
    Función asincrona para 
    crear una nueva categoría
*/
export async function crearCategoria(categoriaData) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api-ruki/categories/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(categoriaData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al crear la categoría");
    }
    return response.json();
}

/*
    Función asincrona para eliminar 
    una categoría (desactivación lógica)
*/
export async function eliminarCategoria(id) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api-ruki/categories/delete/${id}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error("Error al eliminar la categoría");
    return true; // Retorna true si fue exitoso (200 OK)
}

/*
    Función asincrona para 
    crear un nuevo producto
*/
export async function crearProducto(productoData) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api-ruki/products/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(productoData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al crear el producto");
    }
    return response.json();
}

/*
    Función asincrona para eliminar un 
    producto (desactivación lógica)
*/
export async function eliminarProducto(id) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api-ruki/products/delete/${id}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error("Error al eliminar el producto");
    return true; // Retorna true si fue exitoso (200 OK)
}

/*
    Función asincrona para descontar 
    stock de un producto (por si acaso)
*/
export async function descontarStockProducto(id, quantity) {
    const token = getToken();
    // Usamos URLSearchParams para mandar el @RequestParam "quantity"
    const response = await fetch(`${API_BASE_URL}/api-ruki/products/${id}/discount-stock?quantity=${quantity}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al descontar stock (puede que no haya suficiente)");
    }
    return true;
}