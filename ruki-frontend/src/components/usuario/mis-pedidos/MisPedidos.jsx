import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { obtenerMisPedidos, cancelarMiPedido } from '../../../services/PedidoService'; 
import { obtenerProductoPorId } from '../../../services/ProductoService';

export function MisPedidos() {
    const { isAuthenticated } = useAuth();
    const [pedidos, setPedidos] = useState([]);

    const [nombresProductos, setNombresProductos] = useState({}); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthenticated) cargarPedidos();
        else setLoading(false);
    }, [isAuthenticated]);

    const cargarPedidos = async () => {
        try {
            
            /*
                Obtenemos las órdenes
            */
            const data = await obtenerMisPedidos();
            const ordenesOrdenadas = data.sort((a, b) => b.id - a.id);
            setPedidos(ordenesOrdenadas);

            /*
                Extraemos todos los IDs de productos 
                únicos que el cliente ha comprado alguna vez
            */
            const idsUnicos = new Set();
            ordenesOrdenadas.forEach(pedido => {
                pedido.items.forEach(item => idsUnicos.add(item.productId));
            });

            /*
                Buscando los nombres de los productos en paralelo
            */
            const diccionarioNombres = {};
            await Promise.all(Array.from(idsUnicos).map(async (id) => {
                try {
                    const prod = await obtenerProductoPorId(id);
                    diccionarioNombres[id] = prod.name;
                } catch (e) {

                    /*
                        En caso de que el producto haya 
                        sido eliminado o haya algún error
                    */
                    diccionarioNombres[id] = "Producto Desconocido"; 
                }
            }));

            /*
                Guardamos el diccionario en el estado
            */
            setNombresProductos(diccionarioNombres);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = async (id) => {
        if (!window.confirm("¿Estás seguro de cancelar este pedido?")) return;
        try {
            await cancelarMiPedido(id);

            /*
                Recargar para ver el estado CANCELLED
            */
            cargarPedidos(); 
        } catch (err) {
            alert(err.message);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PAID': return <span className="badge bg-success rounded-pill px-3 py-2" style={{fontSize: '11px', letterSpacing: '0.05em'}}>PAGADO</span>;
            case 'PENDING': return <span className="badge bg-warning text-dark rounded-pill px-3 py-2" style={{fontSize: '11px', letterSpacing: '0.05em'}}>PENDIENTE</span>;
            case 'SHIPPED': return <span className="badge bg-primary rounded-pill px-3 py-2" style={{fontSize: '11px', letterSpacing: '0.05em'}}>ENVIADO</span>;
            case 'CANCELLED': return <span className="badge bg-danger rounded-pill px-3 py-2" style={{fontSize: '11px', letterSpacing: '0.05em'}}>CANCELADO</span>;
            default: return <span className="badge bg-secondary rounded-pill px-3 py-2" style={{fontSize: '11px', letterSpacing: '0.05em'}}>{status}</span>;
        }
    };

    if (loading) return <div className="text-center mt-5"><i className="fas fa-circle-notch fa-spin fa-3x" style={{color: '#1d1d1f'}}></i></div>;
    if (!isAuthenticated) return <div className="text-center mt-5 fw-bold">Debes iniciar sesión para ver tus pedidos.</div>;

    return (
        <div style={{ backgroundColor: '#f5f5f7', minHeight: '100vh', padding: '40px 0', fontFamily: "'-apple-system', BlinkMacSystemFont, 'Inter', sans-serif" }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                
                <div className="mb-5 border-bottom border-2 pb-4" style={{ borderColor: "#e5e5ea" }}>
                    <h1 className="fw-bolder text-dark mb-1" style={{ letterSpacing: "-0.04em", fontSize: "2.5rem" }}>Tus Pedidos</h1>
                    <p className="text-secondary fw-medium mb-0" style={{ color: "#86868b" }}>Historial de <strong>pedidos</strong> que has <strong>realizado</strong></p>
                </div>
                
                {error && <div className="alert alert-danger rounded-4 border-1">{error}</div>}

                {pedidos.length === 0 ? (
                    <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                        <i className="fas fa-box-open fa-4x mb-3" style={{ color: '#d2d2d7' }}></i>
                        <h4 className="fw-bolder text-dark">Aún no tienes pedidos</h4>
                        <p className="text-muted fw-medium">¡Anímate a hacer tu primera compra en RUKI!</p>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-4">
                        {pedidos.map(pedido => (
                            <div key={pedido.id} className="card border-2 rounded-4 overflow-hidden" style={{border: '1.5px solid #e5e5ea'}}>

                                <div className="card-header bg-white border-bottom-0 pt-4 px-4 d-flex justify-content-between align-items-start">
                                    <div>
                                        <span className="text-muted small fw-bolder" style={{letterSpacing: '0.05em'}}>ORDEN #{pedido.id}</span>
                                        <p className="mb-0 fw-bolder fs-4 text-dark">${Number(pedido.totalAmount).toLocaleString('es-CL')}</p>
                                    </div>
                                    <div className="mt-1">{getStatusBadge(pedido.status)}</div>
                                </div>
                                
                                {/* CUERPO DEL PEDIDO */}
                                <div className="card-body px-4 pb-4">
                                    <p className="small fw-bolder text-muted mb-2" style={{letterSpacing: '0.02em'}}>PRODUCTOS</p>
                                    
                                    <ul className="list-group list-group-flush mb-3 border rounded-3 overflow-hidden">
                                        {pedido.items.map(item => (
                                            <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center border-0 border-bottom last-border-0 py-3" style={{ background: '#fbfbfd' }}>
                                                
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="badge bg-light text-dark border px-2 py-1">{item.quantity}x</span>
                                                    <span className="fw-semibold text-dark" style={{fontSize: '14px'}}>
                                                        {nombresProductos[item.productId] || 'Cargando...'}
                                                    </span>
                                                </div>

                                                <span className="fw-bolder text-dark" style={{fontSize: '14px'}}>
                                                    ${Number(item.unitPrice).toLocaleString('es-CL')} c/u
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    
                                    {pedido.status === 'PENDING' && (
                                        <div className="text-end pt-2">
                                            <button 
                                                className="btn btn-sm btn-outline-danger fw-bold rounded-pill px-4 py-2" 
                                                onClick={() => handleCancelar(pedido.id)}
                                                style={{fontSize: '12px'}}
                                            >
                                                Cancelar Pedido
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}