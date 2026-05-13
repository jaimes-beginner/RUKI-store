import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { obtenerMisPedidos, cancelarMiPedido } from '../../../services/PedidoService'; 
import { obtenerProductoPorId } from '../../../services/ProductoService';
import { motion, AnimatePresence } from 'framer-motion';
import './MisPedidos.css';

export function MisPedidos() {
    const { isAuthenticated } = useAuth();
    const [pedidos, setPedidos] = useState([]);
    const [nombresProductos, setNombresProductos] = useState({}); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ESTADOS PARA FILTROS FRONTEND
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [busqueda, setBusqueda] = useState('');
    const [tarjetasExpandidas, setTarjetasExpandidas] = useState({}); // Controla qué pedidos están abiertos

    useEffect(() => {
        if (isAuthenticated) cargarPedidos();
        else setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const cargarPedidos = async () => {
        try {
            const data = await obtenerMisPedidos();
            const ordenesOrdenadas = data.sort((a, b) => b.id - a.id);
            setPedidos(ordenesOrdenadas);

            const idsUnicos = new Set();
            ordenesOrdenadas.forEach(pedido => {
                pedido.items.forEach(item => idsUnicos.add(item.productId));
            });

            const diccionarioNombres = {};
            await Promise.all(Array.from(idsUnicos).map(async (id) => {
                try {
                    const prod = await obtenerProductoPorId(id);
                    diccionarioNombres[id] = prod.name;
                } catch (e) {
                    diccionarioNombres[id] = "Producto Desconocido"; 
                }
            }));
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
            cargarPedidos();
        } catch (err) {
            alert(err.message);
        }
    };

    const toggleExpandir = (id) => {
        setTarjetasExpandidas(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // LÓGICA DE FILTRADO (FRONTEND)
    const pedidosFiltrados = useMemo(() => {
        return pedidos.filter(pedido => {
            // Filtro por Estado
            if (filtroEstado !== 'TODOS' && pedido.status !== filtroEstado) return false;
            
            // Búsqueda por ID (ej. si el usuario escribe "17", mostrar la orden 17)
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

    if (loading) {
        return (
            <div className="orders-loading-screen">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <i className="fas fa-circle-notch fa-spin fa-3x" style={{ color: '#0a84ff' }}></i>
                </motion.div>
            </div>
        );
    }

    if (!isAuthenticated) return <div className="orders-auth-warning">Debes iniciar sesión para ver tus pedidos.</div>;

    return (
        <div className="orders-main-glass-wrapper">
            {/* Luces Ambientales */}
            <div className="orders-ambient-blob blob-1"></div>
            <div className="orders-ambient-blob blob-2"></div>

            <div className="orders-container-glass">
                
                {/* CABECERA */}
                <motion.div 
                    className="orders-page-header-glass"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1>Historial de Pedidos</h1>
                    <p>Revisa, filtra y gestiona todas tus compras.</p>
                </motion.div>
                
                {error && <div className="orders-alert-error-glass"><i className="fas fa-exclamation-triangle me-2"></i>{error}</div>}

                {/* PANEL DE FILTROS FRONTEND */}
                {pedidos.length > 0 && (
                    <motion.div 
                        className="orders-filters-glass"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* Buscador Rápido */}
                        <div className="orders-search-wrapper">
                            <i className="fas fa-search search-icon"></i>
                            <input 
                                type="text" 
                                placeholder="Buscar por Orden #" 
                                className="orders-search-glass"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>

                        {/* Píldoras de Estado */}
                        <div className="orders-filter-pills">
                            {['TODOS', 'PENDING', 'PAID', 'SHIPPED', 'CANCELLED'].map(estado => (
                                <motion.button
                                    key={estado}
                                    whileTap={{ scale: 0.95 }}
                                    className={`filter-pill-glass ${filtroEstado === estado ? 'active' : ''}`}
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
                        className="orders-empty-state-glass"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="empty-icon-glass">
                            <i className="fas fa-box-open fa-2x"></i>
                        </div>
                        <h4>{pedidos.length === 0 ? 'Aún no tienes pedidos' : 'No se encontraron resultados'}</h4>
                        <p>{pedidos.length === 0 ? '¡Anímate a hacer tu primera compra en RUKI!' : 'Intenta con otro número de orden o estado.'}</p>
                    </motion.div>
                ) : (
                    <motion.div className="orders-list-glass" layout>
                        <AnimatePresence>
                            {pedidosFiltrados.map(pedido => {
                                const statusBadge = getStatusConfig(pedido.status);
                                const isExpanded = tarjetasExpandidas[pedido.id];

                                return (
                                    <motion.div 
                                        key={pedido.id} 
                                        className="order-card-glass"
                                        layout
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                    >
                                        {/* CABECERA (ACORDEÓN TRIGGER) */}
                                        <div className="order-header-glass" onClick={() => toggleExpandir(pedido.id)}>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="order-icon-glass">
                                                    <i className={`fas ${statusBadge.icon} ${statusBadge.className.replace('badge-', 'text-')}`}></i>
                                                </div>
                                                <div>
                                                    <span className="order-id-label">ORDEN #{pedido.id}</span>
                                                    <h3 className="order-total-price">
                                                        ${Number(pedido.totalAmount).toLocaleString('es-CL')}
                                                    </h3>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-3">
                                                <span className={`order-status-badge ${statusBadge.className}`}>
                                                    {statusBadge.text}
                                                </span>
                                                <motion.i 
                                                    className="fas fa-chevron-down text-muted"
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
                                                    <div className="order-body-glass">
                                                        <p className="order-section-title">PRODUCTOS ADQUIRIDOS</p>
                                                        <div className="order-items-list-glass">
                                                            {pedido.items.map(item => (
                                                                <div key={item.id} className="order-item-row-glass">
                                                                    <div className="item-info-group">
                                                                        <span className="item-quantity-glass">{item.quantity}x</span>
                                                                        <span className="item-name">{nombresProductos[item.productId] || 'Cargando...'}</span>
                                                                    </div>
                                                                    <span className="item-price">
                                                                        ${Number(item.unitPrice).toLocaleString('es-CL')} <small>c/u</small>
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        
                                                        {pedido.status === 'PENDING' && (
                                                            <div className="order-actions-glass">
                                                                <motion.button 
                                                                    whileTap={{ scale: 0.95 }}
                                                                    className="btn-cancel-glass" 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation(); // Evita que se cierre el acordeón
                                                                        handleCancelar(pedido.id);
                                                                    }}
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