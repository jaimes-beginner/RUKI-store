const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://137.184.109.26:8000";

const getToken = () => localStorage.getItem("ruki_token");

/*===============================*/
/* ENDPOINTS DE PAGOS         */
/*===============================*/

/*
    Función asíncrona para generar el link de pago, esto 
    recibe el ID de la orden que se acaba de crear y 
    devuelve la URL de nuestra pasarela (RukiPay por ahora)
*/
export async function crearLinkDePago(orderId) {
    const response = await fetch(`${API_BASE_URL}/api-ruki/payments/create?orderId=${orderId}`, {
        method: "POST",
        headers: {"Authorization": `Bearer ${getToken()}`
        }
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Error al conectar con la pasarela de pagos");
    }
    
    return response.json(); 
}