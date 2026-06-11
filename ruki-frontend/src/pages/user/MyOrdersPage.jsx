import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext'; 
import { obtenerMisPedidos, cancelarMiPedido } from '@/services/PedidoService'; 
import { obtenerProductoPorId } from '@/services/ProductoService'; 
import { obtenerDireccionesPorUsuario } from '@/services/UsuarioService'; 
import { motion, AnimatePresence } from 'framer-motion';
import './MyOrdersPage.css';

export default function MyOrdersPage() {
    const { isAuthenticated, usuario } = useAuth();
    const [pedidos, setPedidos] = useState([]);
    const [productosInfo, setProductosInfo] = useState({}); 
    const [direccionesInfo, setDireccionesInfo] = useState({}); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [busqueda, setBusqueda] = useState('');
    const [tarjetasExpandidas, setTarjetasExpandidas] = useState({});
    const [currentPage, setCurrentPage] = useState(0); 
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (isAuthenticated) cargarPedidos();
        else setLoading(false);
    }, [isAuthenticated, currentPage, filtroEstado, busqueda]);

    const cargarPedidos = async () => {
        setLoading(true);
        try {
            const data = await obtenerMisPedidos(filtroEstado, busqueda, currentPage, 8);
            setPedidos(data.content);
            setTotalPages(data.totalPages);

            let diccionarioDirecciones = {};
            if (usuario && usuario.id) {
                try {
                    const dirs = await obtenerDireccionesPorUsuario(usuario.id);
                    dirs.forEach(dir => { diccionarioDirecciones[dir.id] = `${dir.street}, ${dir.city}, ${dir.region}`; });
                    setDireccionesInfo(diccionarioDirecciones);
                } catch (e) { console.error("No se pudieron cargar las direcciones", e); }
            }

            const idsUnicos = new Set();
            data.content.forEach(pedido => {
                const items = pedido.detalles || pedido.items || [];
                items.forEach(item => idsUnicos.add(item.productId));
            });

            const diccionarioProductos = {};
            await Promise.all(Array.from(idsUnicos).map(async (id) => {
                try {
                    const prod = await obtenerProductoPorId(id);
                    diccionarioProductos[id] = prod; 
                } catch (e) { diccionarioProductos[id] = null; }
            }));
            setProductosInfo(diccionarioProductos);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("¿Estás seguro de cancelar este pedido?")) return;
        try {
            await cancelarMiPedido(id);
            cargarPedidos();
        } catch (err) {
            alert(err.message);
        }
    };

    const toggleExpandir = (id) => setTarjetasExpandidas(prev => ({ ...prev, [id]: !prev[id] }));

    const pedidosFiltrados = useMemo(() => {
        return pedidos.filter(pedido => {
            if (filtroEstado !== 'TODOS' && pedido.status !== filtroEstado) return false;
            if (busqueda.trim() !== '') return pedido.id.toString().includes(busqueda.trim());
            return true;
        });
    }, [pedidos, filtroEstado, busqueda]);

    const getStatusConfig = (status) => {
        const config = {
            PAID: { text: 'PAGADO', className: 'badge-paid', icon: 'fa-check-circle' },
            PENDING: { text: 'PENDIENTE', className: 'badge-pending', icon: 'fa-clock' },
            SHIPPED: { text: 'ENVIADO', className: 'badge-shipped', icon: 'fa-truck' },
            DELIVERED: { text: 'ENTREGADO', className: 'badge-delivered', icon: 'fa-box-open' }, 
            CANCELLED: { text: 'CANCELADO', className: 'badge-cancelled', icon: 'fa-times-circle' }
        };
        return config[status] || { text: status, className: 'badge-default', icon: 'fa-box' };
    };

    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'Fecha no disponible';
        const opciones = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(fechaString).toLocaleDateString('es-CL', opciones);
    };

    return (
        <div className="orders-main-wrapper">
            <div className="orders-glow-container">
                <div className="orders-glow-blob orders-blob-blue"></div>
                <div className="orders-glow-blob orders-blob-purple"></div>
            </div>

            <div className="orders-container position-relative z-1">
                <motion.div className="orders-page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1>Historial de Pedidos</h1>
                    <p>Revisa el detalle, estado y seguimiento de tus compras.</p>
                </motion.div>
                
                {error && <div className="alert alert-danger border-danger bg-transparent text-danger rounded-4 mb-4"><i className="fas fa-exclamation-triangle me-2"></i>{error}</div>}

                {!isAuthenticated ? (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '40vh' }}>
                        <i className="fas fa-lock fa-3x mb-3 text-secondary opacity-50"></i>
                        <h5 className="text-white">Acceso Restringido</h5>
                        <p className="text-secondary">Debes iniciar sesión para ver tus pedidos.</p>
                    </div>
                ) : loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                            <i className="fas fa-circle-notch fa-spin fa-3x mb-3" style={{ color: '#5e5ce6' }}></i>
                            <p className="text-secondary fw-semibold">Recuperando tu historial de compras...</p>
                        </motion.div>
                    </div>
                ) : (
                    <>
                        {pedidos.length > 0 && (
                            <motion.div className="orders-filters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                                <div className="orders-search-wrapper">
                                    <i className="fas fa-search search-icon"></i>
                                    <input type="text" placeholder="Buscar por Orden #" className="orders-search-input" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setCurrentPage(0); }} />
                                </div>
                                <div className="orders-filter-pills">
                                    {['TODOS', 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(estado => (
                                        <motion.button key={estado} whileTap={{ scale: 0.95 }} className={`filter-pill ${filtroEstado === estado ? 'active' : ''}`} onClick={() => { setFiltroEstado(estado); setCurrentPage(0); }}>
                                            {estado === 'TODOS' ? 'Todos' : getStatusConfig(estado).text}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {pedidosFiltrados.length === 0 ? (
                            <motion.div className="orders-empty-state" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                <div className="empty-icon"><i className="fas fa-box-open fa-2x"></i></div>
                                <h4>{pedidos.length === 0 ? 'Aún no tienes pedidos' : 'No se encontraron resultados'}</h4>
                                <p className="text-secondary">{pedidos.length === 0 ? '¡Anímate a hacer tu primera compra en RUKI!' : 'Intenta con otro número de orden o estado.'}</p>
                            </motion.div>
                        ) : (
                            <motion.div className="orders-list" layout>
                                <AnimatePresence>
                                    {pedidosFiltrados.map(pedido => {
                                        const statusBadge = getStatusConfig(pedido.status);
                                        const isExpanded = tarjetasExpandidas[pedido.id];
                                        const totalPedido = pedido.totalAmount || pedido.montoTotal || 0;
                                        const listaItems = pedido.items || pedido.detalles || [];
                                        const fechaPedido = pedido.createdAt || pedido.fechaPedido;
                                        const direccionReal = pedido.shippingAddressId === null || !pedido.shippingAddressId ? "Venta Presencial | Retiro en Tienda Física (RUKI Store)" : (direccionesInfo[pedido.shippingAddressId] || "Dirección no encontrada en el perfil");

                                        return (
                                            <motion.div key={pedido.id} className="order-card" layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}>
                                                <div className="order-header" onClick={() => toggleExpandir(pedido.id)}>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="order-icon"><i className={`fas ${statusBadge.icon} ${statusBadge.className.replace('badge-', 'text-')}`}></i></div>
                                                        <div>
                                                            <span className="order-id-label">ORDEN #{pedido.id} • {formatearFecha(fechaPedido)}</span>
                                                            <h3 className="order-total-price">${Number(totalPedido).toLocaleString('es-CL')}</h3>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
                                                        <span className={`order-status-badge ${statusBadge.className}`}>{statusBadge.text}</span>
                                                        <motion.i className="fas fa-chevron-down text-muted d-none d-md-block" animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}></motion.i>
                                                    </div>
                                                </div>
                                                
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="order-body-expandable">
                                                            <div className="order-body">
                                                                <div className="order-shipping-info mb-4">
                                                                    <p className="order-section-title"><i className="fas fa-map-marker-alt me-2"></i>DIRECCIÓN DE ENVÍO</p>
                                                                    <div className="p-3 rounded-3 border-dark small fw-medium" style={{ backgroundColor: 'rgba(255,255,255,0.03)', color: '#e5e5ea' }}>{direccionReal}</div>
                                                                </div>

                                                                <p className="order-section-title"><i className="fas fa-box me-2"></i>PRODUCTOS ADQUIRIDOS</p>
                                                                <div className="order-items-list " style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                                                                    {listaItems.map(item => {
                                                                        const prodCompleto = productosInfo[item.productId];
                                                                        const imgUrl = prodCompleto?.imageUrls?.[0] || 'https://via.placeholder.com/60?text=RUKI';
                                                                        const prodName = prodCompleto?.name || 'Producto Desconocido';
                                                                        const talla = item.size || item.selectedSize || 'Única';
                                                                        const precioUnitario = item.unitPrice || item.precioEnCompra || 0;
                                                                        
                                                                        return (
                                                                            <div key={item.id} className="order-item-row" style={{ backgroundColor: 'transparent', borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                                                                                <div className="d-flex align-items-center gap-3">
                                                                                    <img src={imgUrl} alt={prodName} className="order-item-img" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                                                                                    <div className="item-details">
                                                                                        <span className="item-name text-white">{prodName}</span>
                                                                                        <div className="d-flex align-items-center gap-2 mt-1">
                                                                                            <span className="item-meta px-2 py-1 rounded-2 border-dark" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#a1a1a6' }}>Talla: {talla}</span>
                                                                                            <span className="item-meta px-2 py-1 rounded-2 border-dark" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#a1a1a6' }}>Cant: {item.quantity || item.cantidad}</span>
                                                                                            {prodCompleto?.sale && <span className="item-meta bg-danger text-white px-2 py-1 rounded-2 border border-danger">OFERTA</span>}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="item-price text-end text-white">
                                                                                    ${Number(precioUnitario).toLocaleString('es-CL')} <br/>
                                                                                    <small className="text-secondary fw-normal" style={{fontSize: '12px'}}>Subtotal: ${(Number(precioUnitario) * (item.quantity || item.cantidad)).toLocaleString('es-CL')}</small>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>

                                                                <div className="order-payment-summary mt-4">
                                                                    <p className="order-section-title"><i className="fas fa-receipt me-2"></i>RESUMEN DE PAGO</p>
                                                                    <div className="p-3 rounded-3 border small border-dark" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.08)' }}>
                                                                        <div className="d-flex justify-content-between mb-2 text-secondary fw-medium"><span>Subtotal (Neto)</span><span className="text-white opacity-75">${Number(pedido.subTotal || 0).toLocaleString('es-CL')}</span></div>
                                                                        <div className="d-flex justify-content-between mb-2 text-secondary fw-medium"><span>IVA (19%)</span><span className="text-white opacity-75">${Number(pedido.taxAmount || 0).toLocaleString('es-CL')}</span></div>
                                                                        <div className="d-flex justify-content-between mt-2 pt-2 fw-bolder text-white" style={{ fontSize: '14px', borderTop: '1px solid rgba(255,255,255,0.1)' }}><span>Total</span><span>${Number(totalPedido).toLocaleString('es-CL')}</span></div>
                                                                    </div>
                                                                </div>
                                                                
                                                                {pedido.status === 'PENDING' && (
                                                                    <div className="order-actions mt-4">
                                                                        <motion.button whileTap={{ scale: 0.95 }} className="btn-cancel-order" onClick={(e) => handleCancelar(pedido.id, e)}>Cancelar Pedido</motion.button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center align-items-center gap-3 mt-5 mb-4">
                                <button className="btn btn-outline-light" disabled={currentPage === 0} onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0,0); }}><i className="fas fa-chevron-left"></i> Anterior</button>
                                <span className="text-white fw-bold">Página {currentPage + 1} de {totalPages}</span>
                                <button className="btn btn-outline-light" disabled={currentPage >= totalPages - 1} onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0,0); }}>Siguiente <i className="fas fa-chevron-right"></i></button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}