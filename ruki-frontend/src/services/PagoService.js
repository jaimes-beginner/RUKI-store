import api from '@/config/api';

/*----------------------------------*/
/*             CLIENTE              */
/*----------------------------------*/

// FUNCIÓN PARA CREAR UN LINK DE PAGO PARA UNA ORDEN ESPECÍFICA
export const crearLinkDePago = (orderId) => api.post(`/payments/create?orderId=${orderId}`);