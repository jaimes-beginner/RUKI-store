import api from '@/config/api';

/*----------------------------------*/
/*             CLIENTE              */
/*----------------------------------*/

// FUNCIÓN PARA CREAR UN PEDIDO
export const crearPedido = (orderData, idempotencyKey) => 
    api.post('/orders/create', orderData, { headers: { 'Idempotency-Key': idempotencyKey } });

// FUNCIÓN PARA OBTENER LOS PEDIDOS DE UN USUARIO
export const obtenerMisPedidos = (status = '', orderId = '', page = 0, size = 8) => {
    const params = new URLSearchParams({ page, size });
    if (status && status !== 'TODOS') params.append("status", status);
    if (orderId) params.append("orderId", orderId);
    return api.get(`/orders/me?${params.toString()}`);
};

// FUNCIÓN PARA INICIAR EL PROCESO DE PAGO CON STRIPE
export const iniciarPagoStripe = (orderId) => api.post(`/payments/create?orderId=${orderId}`);

// FUNCIÓN PARA OBTENER LOS DETALLES DE UN PEDIDO POR SU ID
export const obtenerPedidoPorId = (id) => api.get(`/orders/${id}`);

// FUNCIÓN PARA CANCELAR UN PEDIDO PROPIO (En discusión)
export const cancelarMiPedido = (id) => api.patch(`/orders/me/${id}/cancel`);


/*----------------------------------*/
/*          ADMINISTRADOR           */
/*----------------------------------*/

// OBTENER TODOS LOS PEDIDOS
export const obtenerTodosLosPedidos = () => api.get('/orders/admin/all');

// OBTENER PEDIDOS PAGINADOS PARA ADMIN
export const obtenerPedidosPaginados = (page = 0, size = 9) => api.get(`/orders/admin/paged?page=${page}&size=${size}`);

// ACTUALIZAR EL ESTADO DE UN PEDIDO
export const actualizarEstadoPedido = (id, status) => api.put(`/orders/admin/${id}/status?status=${status}`);

// CREAR UN PEDIDO FÍSICO
export const crearPedidoFisico = (orderData) => api.post('/orders/physical', orderData);
