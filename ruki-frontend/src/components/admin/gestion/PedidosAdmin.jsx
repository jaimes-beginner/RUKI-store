import { useState, useEffect } from "react";
import { obtenerTodosLosPedidos, actualizarEstadoPedido } from "../../../services/PedidoService"; 
import { obtenerProductoPorId } from "../../../services/ProductoService";
import { motion, AnimatePresence } from "framer-motion";
import './PedidosAdmin.css'; 

/*
    Variantes para las animaciónes 
    de los pedidos
*/
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export function PedidosAdmin() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "success" });
    
    /*
        Diccionario para los nombre de los productos
    */
    const [nombresProductos, setNombresProductos] = useState({});

    /*
        Estado para el pedido que el admin 
        seleccione para ver detalles
    */
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [nuevoEstado, setNuevoEstado] = useState("");

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const data = await obtenerTodosLosPedidos();
            const ordenados = (Array.isArray(data) ? data : []).sort((a, b) => b.id - a.id);
            setPedidos(ordenados);

            /*
                Extraer IDs y buscar nombres para el Admin
            */
            const idsUnicos = new Set();
            ordenados.forEach(pedido => {
                pedido.items?.forEach(item => idsUnicos.add(item.productId));
            });

            const diccionarioNombres = {};
            await Promise.all(Array.from(idsUnicos).map(async (id) => {
                try {
                    const prod = await obtenerProductoPorId(id);
                    diccionarioNombres[id] = prod.name;
                } catch (e) {
                    diccionarioNombres[id] = "Producto Eliminado/Desconocido";
                }
            }));
            setNombresProductos(diccionarioNombres);

        } catch (error) {
            console.error("Error cargando pedidos", error);
            mostrarToast("Error al cargar los pedidos", "danger");
        }
    };

    const mostrarToast = (mensaje, tipo = "success") => {
        setToast({ mostrar: true, mensaje, tipo });
        setTimeout(() => setToast((prev) => ({ ...prev, mostrar: false })), 3500);
    };

    const handleVerDetalle = (pedido) => {
        setPedidoSeleccionado(pedido);
        setNuevoEstado(pedido.status || pedido.estado || "PENDING");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleActualizarEstado = async (e) => {
        e.preventDefault();
        if (!pedidoSeleccionado) return;

        setLoading(true);
        try {
            await actualizarEstadoPedido(pedidoSeleccionado.id, nuevoEstado);
            mostrarToast(`Estado del pedido #${pedidoSeleccionado.id} actualizado a ${nuevoEstado}`);
            
            await cargarDatos();
            setPedidoSeleccionado({ ...pedidoSeleccionado, status: nuevoEstado });
        } catch (error) {
            mostrarToast("Error: " + error.message, "danger");
        } finally {
            setLoading(false);
        }
    };

    const formatearPrecio = (precio) => {
        return `$${Number(precio).toLocaleString('es-CL')}`;
    };

    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return "—";
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' });
    };

    const renderBadgeEstado = (statusStr) => {
        const s = String(statusStr).toUpperCase();
        if (s === 'COMPLETED' || s === 'DELIVERED' || s === 'PAID' || s === 'SHIPPED') {
            return <span className="ord-badge badge-ok">{s}</span>;
        }
        if (s === 'CANCELED' || s === 'CANCELLED') {
            return <span className="ord-badge badge-out">CANCELADO</span>;
        }
        return <span className="ord-badge badge-low">{s}</span>;
    };

    return (
        <div className="orders-premium-wrapper">

            {/* LUCES AMBIENTALES */}
            <div className="ord-ambient-blob ord-blob-1"></div>
            <div className="ord-ambient-blob ord-blob-2"></div>

            <div className="container py-4 position-relative" style={{ zIndex: 1 }}>
                
                <motion.header 
                    className="ord-page-header-glass"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="ord-title">Gestión de Pedidos</h1>
                    <p className="ord-subtitle">Supervisa la logística y despachos de <strong>RUKI</strong>.</p>
                </motion.header>
                
                <div className="ord-toast-container">
                    <AnimatePresence>
                        {toast.mostrar && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: -20 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                className={`ord-toast-glass ${toast.tipo === "danger" ? "error" : "success"}`}
                            >
                                <i className={`fas ${toast.tipo === "danger" ? "fa-exclamation-triangle" : "fa-check-circle"} me-2 fs-5`}></i>
                                {toast.mensaje}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <motion.div className="row g-4" variants={containerVariants} initial="hidden" animate="visible">
                    
                    {/* PANEL IZQUIERDO CON EL DETALLE Y EDICIÓN */}
                    <motion.div className="col-lg-4" variants={cardVariants}>
                        <div className="ord-card-glass">
                            <div className="ord-card-header d-flex justify-content-between align-items-center">
                                <div>
                                    <i className="fas fa-box-open me-2 text-primary"></i> 
                                    Detalle del Pedido
                                </div>
                                {pedidoSeleccionado && (
                                    <span className="ord-badge badge-dark">#{pedidoSeleccionado.id}</span>
                                )}
                            </div>
                            
                            <div className="p-4">
                                {!pedidoSeleccionado ? (
                                    <div className="text-center py-5">

                                        {/* SVG NATIVO DE UN MOUSE */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted opacity-50 mb-3">
                                            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
                                            <path d="M13 13l6 6"></path>
                                        </svg>
                                        <p className="fw-bold text-dark mb-1" style={{fontSize: "13px"}}>Ningún pedido seleccionado</p>
                                        <p className="ord-helper-text mx-auto" style={{maxWidth: "200px"}}>Haz clic en el icono del ojo en la tabla para revisar sus detalles.</p>
                                    </div>
                                ) : (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        
                                        {/* RESUMEN DEL CLIENTE CON SU FECHA */}
                                        <div className="mb-4 pb-3 border-bottom-subtle">
                                            <div className="d-flex justify-content-between mb-2 align-items-center">
                                                <span className="ord-label mb-0">Fecha de Orden</span>
                                                <span className="fw-bold text-dark" style={{fontSize: "12px"}}>{formatearFecha(pedidoSeleccionado.createdAt)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2 align-items-center">
                                                <span className="ord-label mb-0">ID Cliente</span>
                                                <span className="fw-bold text-dark" style={{fontSize: "12px"}}>Usuario #{pedidoSeleccionado.userId}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mt-3 align-items-center">
                                                <span className="ord-label mb-0">Total Recaudado</span>
                                                <span className="fw-bold text-primary" style={{fontSize: "18px"}}>{formatearPrecio(pedidoSeleccionado.totalAmount)}</span>
                                            </div>
                                        </div>

                                        {/* LISTA DE PRODUCTOS/ITEMS EN FOMRA DE UNA MINI-TABLA */}
                                        <div className="mb-4">
                                            <label className="ord-label mb-2">Artículos a enviar ({pedidoSeleccionado.items?.length || 0})</label>
                                            <div className="ord-mini-table-scroll">
                                                <table className="table table-borderless w-100 mb-0">
                                                    <tbody>
                                                        {(pedidoSeleccionado.items || []).map((item, idx) => (
                                                            <tr key={idx} className="border-bottom-subtle">
                                                                <td className="ps-0 py-2 fw-semibold text-dark" style={{fontSize: '12px', maxWidth: '140px'}}>
                                                                    <div className="text-truncate">{nombresProductos[item.productId] || `Prod #${item.productId}`}</div>
                                                                    <div className="ord-helper-text mt-1">ID: {item.productId}</div>
                                                                </td>
                                                                <td className="text-muted text-center align-middle py-2" style={{fontSize: '12px'}}>
                                                                    x{item.quantity}
                                                                </td>
                                                                <td className="text-end pe-0 fw-bold text-dark align-middle py-2" style={{fontSize: '13px'}}>
                                                                    {formatearPrecio((item.unitPrice || item.price) * item.quantity)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* FORMULARIO DE CAMBIO DE ESTADO */}
                                        <form onSubmit={handleActualizarEstado}>
                                            <div className="ord-input-group mb-4">
                                                <label>Actualizar Estado Logístico</label>
                                                <div className="ord-input-wrapper">
                                                    <i className="fas fa-truck input-icon z-2"></i>
                                                    <select className="ord-input-glass ord-select-glass w-100" value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}>
                                                        <option value="PENDING">PENDING (Pendiente de Pago)</option>
                                                        <option value="PAID">PAID (Pagado / Preparando)</option>
                                                        <option value="SHIPPED">SHIPPED (Enviado / En camino)</option>
                                                        <option value="DELIVERED">DELIVERED (Entregado)</option>
                                                        <option value="CANCELED">CANCELED (Cancelado)</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <motion.button whileTap={{ scale: 0.95 }} type="submit" className="ord-btn-primary w-100" disabled={loading}>
                                                {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>ACTUALIZANDO...</> : "Guardar Cambio de Estado"}
                                            </motion.button>
                                        </form>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* PANEL DERECHO CON LA TABLA DE DATOS */}
                    <motion.div className="col-lg-8" variants={cardVariants}>
                        <div className="ord-card-glass h-100 d-flex flex-column">
                            <div className="ord-card-header d-flex justify-content-between align-items-center">
                                <div><i className="fas fa-list-ul me-2 text-secondary"></i> Historial General</div>
                                <span className="ord-badge badge-neutral">{pedidos.length} ÓRDENES</span>
                            </div>
                            
                            <div className="ord-table-container flex-grow-1">
                                <table className="ord-table">
                                    <thead>
                                        <tr>
                                            <th className="ps-4">ID Orden</th>
                                            <th>Fecha</th>
                                            <th>Monto</th>
                                            <th>Estado</th>
                                            <th className="text-end pe-4">Gestión</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {pedidos.map(p => (
                                                <motion.tr 
                                                    key={p.id} 
                                                    layout
                                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                    className={pedidoSeleccionado?.id === p.id ? 'active-row' : ''}
                                                >
                                                    <td className="ps-4">
                                                        <div className="ord-item-name">#{p.id}</div>
                                                        <div className="ord-item-id">User #{p.userId}</div>
                                                    </td>
                                                    <td className="ord-text-muted">{formatearFecha(p.createdAt)}</td>
                                                    <td className="ord-item-price">{formatearPrecio(p.totalAmount)}</td>
                                                    <td>{renderBadgeEstado(p.status || p.estado)}</td>
                                                    <td className="text-end pe-4">
                                                        {/* BOTÓN VER (SVG NATIVO ANTIBLOQUEOS) */}
                                                        <motion.button 
                                                            whileHover={{ scale: 1.1 }} 
                                                            whileTap={{ scale: 0.9 }} 
                                                            className="ord-action-btn view" 
                                                            onClick={() => handleVerDetalle(p)}
                                                            title="Ver detalles"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                                <circle cx="12" cy="12" r="3"></circle>
                                                            </svg>
                                                        </motion.button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                        {pedidos.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5">
                                                    <div className="ord-empty-state">
                                                        <i className="fas fa-clipboard-list mb-3"></i>
                                                        <p>No hay pedidos registrados en el sistema.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>

                </motion.div>
            </div>
        </div>
    );
}