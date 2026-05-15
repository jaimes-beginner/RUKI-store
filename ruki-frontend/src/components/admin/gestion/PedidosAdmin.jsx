import { useState, useEffect } from "react";
import { obtenerTodosLosPedidos, actualizarEstadoPedido } from "../../../services/PedidoService"; 
import { obtenerProductoPorId } from "../../../services/ProductoService";
import { obtenerDireccionesPorUsuario } from "../../../services/UsuarioService"; // IMPORTANTE: Agregamos esto
import { motion, AnimatePresence } from "framer-motion";
import './PedidosAdmin.css'; 

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
    const [nombresProductos, setNombresProductos] = useState({});

    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [nuevoEstado, setNuevoEstado] = useState("");
    const [direccionCompleta, setDireccionCompleta] = useState("Cargando dirección...");

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const data = await obtenerTodosLosPedidos();
            const ordenados = (Array.isArray(data) ? data : []).sort((a, b) => b.id - a.id);
            setPedidos(ordenados);

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
                    diccionarioNombres[id] = "Producto Desconocido";
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

    /*
        Buscamos la dirección real del usuario cuando seleccionamos el pedido
    */
    const handleVerDetalle = async (pedido) => {
        setPedidoSeleccionado(pedido);
        setNuevoEstado(pedido.status || pedido.estado || "PENDING");
        setDireccionCompleta("Cargando detalles de envío...");
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (pedido.shippingAddressId && pedido.userId) {
            try {
                const dirs = await obtenerDireccionesPorUsuario(pedido.userId);
                const dirExacta = dirs.find(d => d.id === pedido.shippingAddressId);
                if (dirExacta) {
                    setDireccionCompleta(`${dirExacta.street}, ${dirExacta.city}, ${dirExacta.region} ${dirExacta.zipCode ? `(CP: ${dirExacta.zipCode})` : ''}`);
                } else {
                    setDireccionCompleta(`ID Dirección: ${pedido.shippingAddressId} (Fue eliminada o modificada)`);
                }
            } catch (error) {
                setDireccionCompleta("Error al obtener la dirección.");
            }
        } else {
            setDireccionCompleta("Dirección no especificada.");
        }
    };

    const handleActualizarEstado = async (e) => {
        e.preventDefault();
        if (!pedidoSeleccionado) return;

        setLoading(true);
        try {
            await actualizarEstadoPedido(pedidoSeleccionado.id, nuevoEstado);
            mostrarToast(`Estado de la Orden #${pedidoSeleccionado.id} actualizado a ${nuevoEstado}`);
            
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
        if (s === 'CANCELLED' || s === 'CANCELED') {
            return <span className="ord-badge badge-out">CANCELADO</span>;
        }
        return <span className="ord-badge badge-low">{s}</span>;
    };

    return (
        <div className="orders-premium-wrapper">
            <div className="container py-4 position-relative">
                
                <motion.header 
                    className="ord-page-header"
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
                                className={`ord-toast ${toast.tipo === "danger" ? "error" : "success"}`}
                            >
                                <i className={`fas ${toast.tipo === "danger" ? "fa-exclamation-triangle" : "fa-check-circle"} me-2 fs-5`}></i>
                                {toast.mensaje}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <motion.div className="row g-4 align-items-start" variants={containerVariants} initial="hidden" animate="visible">
                    
                    {/* PANEL IZQUIERDO CON EL DETALLE Y EDICIÓN */}
                    <motion.div className="col-lg-4" variants={cardVariants}>
                        <div className="ord-card">
                            <div className="ord-card-header d-flex justify-content-between align-items-center">
                                <div>
                                    <i className="fas fa-box-open me-2 text-dark"></i> 
                                    Detalle del Pedido
                                </div>
                                {pedidoSeleccionado && (
                                    <span className="ord-badge badge-dark">#{pedidoSeleccionado.id}</span>
                                )}
                            </div>
                            
                            <div className="p-4">
                                {!pedidoSeleccionado ? (
                                    <div className="text-center py-5">
                                        <i className="fas fa-mouse-pointer fa-3x text-muted opacity-25 mb-3"></i>
                                        <p className="fw-bold text-dark mb-1" style={{fontSize: "13px"}}>Ningún pedido seleccionado</p>
                                        <p className="ord-helper-text mx-auto" style={{maxWidth: "200px"}}>Haz clic en el icono del ojo en la tabla para revisar sus detalles.</p>
                                    </div>
                                ) : (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        
                                        {/* RESUMEN DEL CLIENTE */}
                                        <div className="mb-4 pb-3 border-bottom-subtle">
                                            <div className="d-flex justify-content-between mb-2 align-items-center">
                                                <span className="ord-label mb-0">Fecha de Orden</span>
                                                <span className="fw-bold text-dark" style={{fontSize: "12px"}}>{formatearFecha(pedidoSeleccionado.createdAt)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2 align-items-center">
                                                <span className="ord-label mb-0">ID Cliente</span>
                                                <span className="fw-bold text-dark" style={{fontSize: "12px"}}>Usuario #{pedidoSeleccionado.userId}</span>
                                            </div>
                                            
                                            {/* DIRECCIÓN TRADUCIDA */}
                                            <div className="bg-light p-3 rounded-3 border mt-3">
                                                <span className="ord-label mb-1 text-dark"><i className="fas fa-map-marker-alt me-1 text-secondary"></i> Destino de Envío</span>
                                                <p className="small mb-0 fw-medium text-dark">{direccionCompleta}</p>
                                            </div>

                                            <div className="d-flex justify-content-between mt-3 align-items-center">
                                                <span className="ord-label mb-0">Total Recaudado</span>
                                                <span className="fw-bold text-dark" style={{fontSize: "18px"}}>{formatearPrecio(pedidoSeleccionado.totalAmount)}</span>
                                            </div>
                                        </div>

                                        {/* LISTA DE PRODUCTOS/ITEMS */}
                                        <div className="mb-4">
                                            <label className="ord-label mb-2">Artículos a enviar ({pedidoSeleccionado.items?.length || 0})</label>
                                            <div className="ord-mini-table-scroll">
                                                <table className="table table-borderless w-100 mb-0">
                                                    <tbody>
                                                        {(pedidoSeleccionado.items || []).map((item, idx) => (
                                                            <tr key={idx} className="border-bottom-subtle">
                                                                <td className="ps-0 py-2 fw-semibold text-dark" style={{fontSize: '12px'}}>
                                                                    <div className="text-truncate" style={{maxWidth: '140px'}}>{nombresProductos[item.productId] || `Prod #${item.productId}`}</div>
                                                                    <div className="d-flex align-items-center gap-2 mt-1">
                                                                        <span className="ord-helper-text m-0">ID: {item.productId}</span>
                                                                        <span className="badge bg-light text-dark border">Talla: {item.size || item.selectedSize || 'Única'}</span>
                                                                    </div>
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
                                                    <select className="ord-input ord-select w-100" value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}>
                                                        <option value="PENDING">PENDING (Pendiente de Pago)</option>
                                                        <option value="PAID">PAID (Pagado / Preparando)</option>
                                                        <option value="SHIPPED">SHIPPED (Enviado / En camino)</option>
                                                        <option value="DELIVERED">DELIVERED (Entregado)</option>
                                                        {/* SOLUCIÓN AL BUG 500: Doble "L" en CANCELLED */}
                                                        <option value="CANCELLED">CANCELLED (Cancelado)</option>
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
                        <div className="ord-card h-100 d-flex flex-column">
                            <div className="ord-card-header d-flex justify-content-between align-items-center">
                                <div><i className="fas fa-list-ul me-2 text-secondary"></i> Historial General</div>
                                <span className="ord-badge badge-light-blue">{pedidos.length} ÓRDENES</span>
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
                                                        {/* BOTÓN VER (CLEAN) */}
                                                        <motion.button 
                                                            whileHover={{ scale: 1.1 }} 
                                                            whileTap={{ scale: 0.9 }} 
                                                            className="ord-action-btn view" 
                                                            onClick={() => handleVerDetalle(p)}
                                                            title="Ver detalles"
                                                        >
                                                            <i className="fas fa-eye"></i>
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