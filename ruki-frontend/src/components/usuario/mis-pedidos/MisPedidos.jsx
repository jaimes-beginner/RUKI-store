import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { obtenerMisPedidos, cancelarMiPedido } from '../../../services/PedidoService'; 
import { obtenerProductoPorId } from '../../../services/ProductoService';
import { obtenerDireccionesPorUsuario } from '../../../services/UsuarioService'; // Agregado
import { motion, AnimatePresence } from 'framer-motion';
import './MisPedidos.css';

export function MisPedidos() {
    
    /*
        Agregamos 'usuario' para poder obtener su ID
    */
    const { isAuthenticated, usuario } = useAuth();
    
    const [pedidos, setPedidos] = useState([]);
    const [productosInfo, setProductosInfo] = useState({}); 

    /*
        Nuevo estado para el diccionario de direcciones
    */
    const [direccionesInfo, setDireccionesInfo] = useState({}); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [busqueda, setBusqueda] = useState('');
    const [tarjetasExpandidas, setTarjetasExpandidas] = useState({});

    useEffect(() => {
        if (isAuthenticated) cargarPedidos();
        else setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const cargarPedidos = async () => {
        try {
            
            /*
                Obtenemos los pedidos del backend
            */
            const data = await obtenerMisPedidos();
            const ordenesOrdenadas = data.sort((a, b) => b.id - a.id);
            setPedidos(ordenesOrdenadas);

            /*
                Descargamos las direcciones del usuario para 
                hacer "match" con el shippingAddressId
            */
            let diccionarioDirecciones = {};
            if (usuario && usuario.id) {
                try {
                    const dirs = await obtenerDireccionesPorUsuario(usuario.id);
                    dirs.forEach(dir => {
                        diccionarioDirecciones[dir.id] = `${dir.street}, ${dir.city}, ${dir.region}`;
                    });
                    setDireccionesInfo(diccionarioDirecciones);
                } catch (e) {
                    console.error("No se pudieron cargar las direcciones", e);
                }
            }

            /*
                Descargamos la información de los productos únicos
            */
            const idsUnicos = new Set();
            ordenesOrdenadas.forEach(pedido => {
                const items = pedido.detalles || pedido.items || [];
                items.forEach(item => idsUnicos.add(item.productId));
            });

            const diccionarioProductos = {};
            await Promise.all(Array.from(idsUnicos).map(async (id) => {
                try {
                    const prod = await obtenerProductoPorId(id);
                    diccionarioProductos[id] = prod; 
                } catch (e) {
                    diccionarioProductos[id] = null; 
                }
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

    const toggleExpandir = (id) => {
        setTarjetasExpandidas(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const pedidosFiltrados = useMemo(() => {
        return pedidos.filter(pedido => {
            if (filtroEstado !== 'TODOS' && pedido.status !== filtroEstado) return false;
            if (busqueda.trim() !== '') {
                return pedido.id.toString().includes(busqueda.trim());
            }
            return true;
        });
    }, [pedidos, filtroEstado, busqueda]);

    const getStatusConfig = (status) => {
        const config = {
            PAID: { text: 'PAGADO', className: 'badge-paid', icon: 'fa-check-circle' },
            PENDING: { text: 'PENDIENTE', className: 'badge-pending', icon: 'fa-clock' },
            SHIPPED: { text: 'ENVIADO', className: 'badge-shipped', icon: 'fa-truck' },
            CANCELLED: { text: 'CANCELADO', className: 'badge-cancelled', icon: 'fa-times-circle' }
        };
        return config[status] || { text: status, className: 'badge-default', icon: 'fa-box' };
    };

    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'Fecha no disponible';
        const opciones = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(fechaString).toLocaleDateString('es-CL', opciones);
    };

    if (loading) {
        return (
            <div className="orders-loading-screen">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <i className="fas fa-circle-notch fa-spin fa-3x text-dark"></i>
                </motion.div>
            </div>
        );
    }

    if (!isAuthenticated) return <div className="orders-auth-warning">Debes iniciar sesión para ver tus pedidos.</div>;

    return (
        <div className="orders-main-wrapper">
            <div className="orders-container">
                
                {/* CABECERA */}
                <motion.div 
                    className="orders-page-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1>Historial de Pedidos</h1>
                    <p>Revisa el detalle, estado y seguimiento de tus compras.</p>
                </motion.div>
                
                {error && <div className="alert alert-danger border-0 rounded-4 mb-4"><i className="fas fa-exclamation-triangle me-2"></i>{error}</div>}

                {/* PANEL DE FILTROS FRONTEND */}
                {pedidos.length > 0 && (
                    <motion.div 
                        className="orders-filters"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="orders-search-wrapper">
                            <i className="fas fa-search search-icon"></i>
                            <input 
                                type="text" 
                                placeholder="Buscar por Orden #" 
                                className="orders-search-input"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>

                        <div className="orders-filter-pills">
                            {['TODOS', 'PENDING', 'PAID', 'SHIPPED', 'CANCELLED'].map(estado => (
                                <motion.button
                                    key={estado}
                                    whileTap={{ scale: 0.95 }}
                                    className={`filter-pill ${filtroEstado === estado ? 'active' : ''}`}
                                    onClick={() => setFiltroEstado(estado)}
                                >
                                    {estado === 'TODOS' ? 'Todos' : getStatusConfig(estado).text}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {pedidosFiltrados.length === 0 ? (
                    <motion.div 
                        className="orders-empty-state"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="empty-icon">
                            <i className="fas fa-box-open fa-2x"></i>
                        </div>
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
                                
                                const direccionReal = direccionesInfo[pedido.shippingAddressId] || `Dirección ID: ${pedido.shippingAddressId} (Dirección eliminada)`;

                                return (
                                    <motion.div 
                                        key={pedido.id} 
                                        className="order-card"
                                        layout
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                    >
                                        {/* CABECERA (ACORDEÓN TRIGGER) */}
                                        <div className="order-header" onClick={() => toggleExpandir(pedido.id)}>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="order-icon">
                                                    <i className={`fas ${statusBadge.icon} ${statusBadge.className.replace('badge-', 'text-')}`}></i>
                                                </div>
                                                <div>
                                                    <span className="order-id-label">ORDEN #{pedido.id} • {formatearFecha(fechaPedido)}</span>
                                                    <h3 className="order-total-price">
                                                        ${Number(totalPedido).toLocaleString('es-CL')}
                                                    </h3>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
                                                <span className={`order-status-badge ${statusBadge.className}`}>
                                                    {statusBadge.text}
                                                </span>
                                                <motion.i 
                                                    className="fas fa-chevron-down text-muted d-none d-md-block"
                                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                                    transition={{ duration: 0.3 }}
                                                ></motion.i>
                                            </div>
                                        </div>
                                        
                                        {/* CUERPO DEL PEDIDO (EXPANDIBLE) */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="order-body-expandable"
                                                >
                                                    <div className="order-body">
                                                        
                                                        {/* SECCIÓN DIRECCIÓN DE ENVÍO */}
                                                        <div className="order-shipping-info mb-4">
                                                            <p className="order-section-title"><i className="fas fa-map-marker-alt me-2"></i>DIRECCIÓN DE ENVÍO</p>
                                                            <div className="bg-light p-3 rounded-3 border border-light text-dark small fw-medium">
                                                                {direccionReal}
                                                            </div>
                                                        </div>

                                                        <p className="order-section-title"><i className="fas fa-box me-2"></i>PRODUCTOS ADQUIRIDOS</p>
                                                        <div className="order-items-list">
                                                            {listaItems.map(item => {
                                                                const prodCompleto = productosInfo[item.productId];
                                                                const imgUrl = prodCompleto?.imageUrls?.[0] || 'https://via.placeholder.com/60?text=RUKI';
                                                                const prodName = prodCompleto?.name || 'Producto Desconocido';
                                                                const talla = item.size || item.selectedSize || 'Única';
                                                                const precioUnitario = item.unitPrice || item.precioEnCompra || 0;
                                                                
                                                                return (
                                                                    <div key={item.id} className="order-item-row">
                                                                        <div className="d-flex align-items-center gap-3">
                                                                            <img src={imgUrl} alt={prodName} className="order-item-img" />
                                                                            <div className="item-details">
                                                                                <span className="item-name">{prodName}</span>
                                                                                <div className="d-flex align-items-center gap-2 mt-1">
                                                                                    <span className="item-meta bg-light border px-2 py-1 rounded-2">Talla: {talla}</span>
                                                                                    <span className="item-meta bg-light border px-2 py-1 rounded-2">Cant: {item.quantity || item.cantidad}</span>
                                                                                    {prodCompleto?.sale && (
                                                                                        <span className="item-meta bg-danger text-white px-2 py-1 rounded-2 border border-danger">OFERTA</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="item-price text-end">
                                                                            ${Number(precioUnitario).toLocaleString('es-CL')} <br/>
                                                                            <small className="text-muted fw-normal">Subtotal: ${(Number(precioUnitario) * (item.quantity || item.cantidad)).toLocaleString('es-CL')}</small>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        
                                                        {pedido.status === 'PENDING' && (
                                                            <div className="order-actions mt-4">
                                                                <motion.button 
                                                                    whileTap={{ scale: 0.95 }}
                                                                    className="btn-cancel-order" 
                                                                    onClick={(e) => handleCancelar(pedido.id, e)}
                                                                >
                                                                    Cancelar Pedido
                                                                </motion.button>
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
            </div>
        </div>
    );
}