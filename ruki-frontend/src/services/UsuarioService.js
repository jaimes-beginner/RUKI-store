const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://137.184.109.26:8000";

const getToken = () => localStorage.getItem("ruki_token");

/*===============================*/
/* ENDPOINTS PUBLICOS */
/*===============================*/

/*
    Función asincrona para crear 
    a un nuevo usuario
*/
export async function crearUsuario(userData) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/users/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Error al crear usuario o correo ya en uso");
    }
    return response.json();
}


/*===============================*/
/* ENDPOINTS PRIVADOS */
/*===============================*/

/*
    Función asincrona para obtener 
    el perfil del usuario logueado
*/
export async function obtenerMiPerfil() {
    const response = await fetch(`${API_BASE_URL}/api-ruki/users/me`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error("Error al obtener tu perfil");
    return response.json();
}

/*
    Función asincrona para obtener el perfil 
    de un usuario específico por su ID
*/
export async function obtenerUsuarioPorId(id) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/users/${id}`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error("Usuario no encontrado");
    return response.json();
}

/*
    Función asincrona para obtener un 
    usuario por su correo electrónico
*/
export async function obtenerUsuarioPorEmail(email) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/users/email/${email}`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error("Usuario no encontrado");
    return response.json();
}

/*
    Función asincrona para actualizar los 
    datos de un usuario específico
*/
export async function actualizarUsuario(id, userData) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/users/update/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error("Error al actualizar usuario");
    return response.json();
}

/*
    Función asincrona para eliminar a 
    un usuario por su ID (Baja lógica)
*/
export async function eliminarUsuario(id) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/users/delete/${id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error("Error al eliminar usuario");
    return true;
}

/*
    Función asincrona para crear 
    una nueva dirección
*/
export async function crearDireccion(addressData) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/addresses/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(addressData),
    });
    if (!response.ok) throw new Error("Error al crear dirección");
    return response.json();
}

/*
    Función asincrona para obtener 
    las direcciones de un usuario
*/
export async function obtenerDireccionesPorUsuario(userId) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/addresses/user/${userId}`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error("Error al obtener direcciones");
    return response.json();
}

/*
    Función asincrona para obtener todas 
    las direcciones activas de un usuario 
*/
export async function obtenerDireccionesActivasPorUsuario(userId) {

    const response = await fetch(`${API_BASE_URL}/api-ruki/addresses/user/${userId}/active`, {
        method: "GET",
        headers: { 
            "Authorization": `Bearer ${getToken()}`,
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) throw new Error("Error al obtener las direcciones activas");
    return await response.json();
}

/*
    Función asincrona para actualizar los 
    datos de una dirección específica
*/
export async function actualizarDireccion(addressId, addressData) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/addresses/update/${addressId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(addressData),
    });
    if (!response.ok) throw new Error("Error al actualizar dirección");
    return response.json();
}

/*
    Función asincrona para eliminar una 
    dirección específica por su ID  
*/
export async function eliminarDireccion(addressId) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/addresses/delete/${addressId}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error("Error al eliminar dirección");
    return true;
}

/*===============================*/
/* ENDPOINTS DEL ADMINISTRADOR */
/*===============================*/

// FUNCION ASINCRONA PARA OBTENER USUARIOS ACTIVOS CON PAGINACIÓN
export async function obtenerUsuariosActivos(page = 0, size = 9) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/users/active?page=${page}&size=${size}`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error("Error al obtener usuarios activos");
    return response.json();
}

// FUNCION ASINCRONA PARA OBTENER TODOS LOS USUARIOS (ACTIVOS E INACTIVOS)
export async function obtenerUsuarios() {
    const response = await fetch(`${API_BASE_URL}/api-ruki/users/admin/all`, 
        { headers: 
            { "Authorization": `Bearer ${getToken()}` }
        });
    if (!response.ok) throw new Error("Error"); return response.json();
}

// FUNCION ASINCRONA PARA OBTENER USUARIOS CON PAGINACIÓN (ACTIVOS E INACTIVOS)
export async function obtenerUsuariosPaginados(page = 0, size = 9) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/users/admin/paged?page=${page}&size=${size}`, 
        { headers: 
            { "Authorization": `Bearer ${getToken()}` } 
        });
    if (!response.ok) throw new Error("Error"); return response.json();
}

/*
    Función asincrona para reactivar 
    a un usuario eliminado por su ID
*/
export async function reactivarUsuario(id) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/users/reactivate/${id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error("Error al reactivar usuario");
    return true;
}

/*
    Función asincrona para obtener todas 
    las direcciones registradas
*/
export async function obtenerTodasLasDirecciones() {
    const response = await fetch(`${API_BASE_URL}/api-ruki/addresses/admin/all`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!response.ok) throw new Error("Error al obtener todas las direcciones");
    return response.json();
}
