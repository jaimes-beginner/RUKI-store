import { useState, useEffect } from "react";
import { obtenerPedidosPaginados, actualizarEstadoPedido } from "@/services/PedidoService"; 
import { obtenerProductoPorId } from "@/services/ProductoService"; 
import { obtenerDireccionesPorUsuario } from "@/services/UsuarioService"; 
import { motion, AnimatePresence } from "framer-motion";
import './OrdersPage.css'; 

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

export default function OrdersPage() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "success" });
    const [nombresProductos, setNombresProductos] = useState({});
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [nuevoEstado, setNuevoEstado] = useState("");
    const [direccionCompleta, setDireccionCompleta] = useState("Cargando dirección...");
    const [showEstadoModal, setShowEstadoModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => { cargarDatos(); }, [currentPage]);

    const cargarDatos = async () => {
        try {
            const data = await obtenerPedidosPaginados(currentPage, 9);
            const ordenados = data.content || [];
            setPedidos(ordenados);
            setTotalPages(data.totalPages);

            const idsUnicos = new Set();
            ordenados.forEach(pedido => { pedido.items?.forEach(item => idsUnicos.add(item.productId)); });

            const diccionarioNombres = {};
            await Promise.all(Array.from(idsUnicos).map(async (id) => {
                try {
                    const prod = await obtenerProductoPorId(id);
                    diccionarioNombres[id] = prod.name;
                } catch (e) { diccionarioNombres[id] = "Producto Desconocido"; }
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
            } catch (error) { setDireccionCompleta("Error al obtener la dirección."); }
        } else { setDireccionCompleta("Dirección no especificada."); }
    };

    const handleActualizarEstado = async (e) => { e.preventDefault(); if (!pedidoSeleccionado) return; setShowEstadoModal(true); };

    const confirmarActualizarEstado = async () => {
        if (!pedidoSeleccionado) return;
        setShowEstadoModal(false);
        setLoading(true);
        try {
            await actualizarEstadoPedido(pedidoSeleccionado.id, nuevoEstado);
            mostrarToast(`Estado de la Orden #${pedidoSeleccionado.id} actualizado a ${nuevoEstado}`);
            await cargarDatos();
            setPedidoSeleccionado({ ...pedidoSeleccionado, status: nuevoEstado });
        } catch (error) { mostrarToast("Error: " + error.message, "danger"); } 
        finally { setLoading(false); }
    };

    const formatearPrecio = (precio) => `$${Number(precio).toLocaleString('es-CL')}`;
    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return "—";
        return new Date(fechaStr).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const renderBadgeEstado = (statusStr) => {
        const s = String(statusStr).toUpperCase();
        if (s === 'COMPLETED' || s === 'DELIVERED' || s === 'PAID' || s === 'SHIPPED') return <span className="ord-badge badge-ok">{s}</span>;
        if (s === 'CANCELLED' || s === 'CANCELED') return <span className="ord-badge badge-out">CANCELADO</span>;
        return <span className="ord-badge badge-low">{s}</span>;
    };

    return (
        <div className="orders-premium-wrapper">
            <div className="orders-glow-container">
                <div className="orders-glow-blob ord-blob-blue"></div>
                <div className="orders-glow-blob ord-blob-coral"></div>
            </div>

            <div className="container py-4 position-relative">
                {/* CABECERA ALINEADA A LA IZQUIERDA */}
                <motion.header className="ord-page-header text-start" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="ord-title">Gestión de Pedidos</h1>
                    <p className="ord-subtitle">Supervisa la logística y despachos de <strong>RUKI</strong>.</p>
                </motion.header>

                <div className="ord-toast-container">
                    <AnimatePresence>
                        {toast.mostrar && (
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className={`ord-toast ${toast.tipo === "danger" ? "error" : "success"}`}>
                                <i className={`fas ${toast.tipo === "danger" ? "fa-exclamation-triangle" : "fa-check-circle"} me-2 fs-5`}></i>{toast.mensaje}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {showEstadoModal && (
                        <div className="ord-modal-backdrop" onClick={() => setShowEstadoModal(false)}>
                            <motion.div className="ord-modal-content text-center" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                                <div className="mb-3">
                                    <i className="fas fa-truck fa-3x mb-3 text-white"></i>
                                    <h4 className="fw-bolder text-white mb-2">Confirmar actualización</h4>
                                    <p className="text-secondary mb-0">¿Deseas cambiar el estado de la orden #{pedidoSeleccionado?.id} a {nuevoEstado}?</p>
                                </div>
                                <div className="d-flex gap-2 mt-4">
                                    <button className="flex-fill ord-btn-outline" onClick={() => setShowEstadoModal(false)}>Cancelar</button>
                                    <button className="flex-fill ord-btn-primary" onClick={confirmarActualizarEstado} disabled={loading}>Confirmar</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <motion.div className="row g-4 align-items-start" variants={containerVariants} initial="hidden" animate="visible">
                    
                    {/* TARJETA DE DETALLE ALINEADA A LA IZQUIERDA */}
                    <motion.div className="col-lg-4" variants={cardVariants}>
                        <div className="ord-card text-start">
                            <div className="ord-card-header d-flex justify-content-between align-items-center">
                                <div><i className="fas fa-box-open me-2"></i>Detalle del Pedido</div>
                                {pedidoSeleccionado && <span className="ord-badge badge-dark">#{pedidoSeleccionado.id}</span>}
                            </div>
                            <div className="p-4">
                                {!pedidoSeleccionado ? (
                                    <div className="text-center py-5">
                                        <i className="fas fa-mouse-pointer fa-3x text-muted opacity-25 mb-3"></i>
                                        <p className="fw-bold text-white mb-1" style={{ fontSize: "13px" }}>Ningún pedido seleccionado</p>
                                        <p className="ord-helper-text mx-auto" style={{ maxWidth: "200px" }}>Haz clic en el icono del ojo en la tabla para revisar sus detalles.</p>
                                    </div>
                                ) : (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <div className="mb-4 pb-3 border-bottom-subtle">
                                            <div className="d-flex justify-content-between mb-2 align-items-center"><span className="ord-label mb-0">Fecha de Orden</span><span className="fw-bold text-white" style={{ fontSize: "12px" }}>{formatearFecha(pedidoSeleccionado.createdAt)}</span></div>
                                            <div className="d-flex justify-content-between mb-2 align-items-center"><span className="ord-label mb-0">ID Cliente</span><span className="fw-bold text-white" style={{ fontSize: "12px" }}>Usuario #{pedidoSeleccionado.userId}</span></div>
                                            <div className="ord-shipping-destination-box mt-3">
                                                <span className="ord-label mb-2 text-white"><i className="fas fa-map-marker-alt me-1 opacity-50"></i> Destino de Envío</span>
                                                <p className="small mb-0 fw-medium" style={{ color: '#e5e5ea' }}>{direccionCompleta}</p>
                                            </div>
                                            <div className="d-flex justify-content-between mt-3 align-items-center"><span className="ord-label mb-0">Total Recaudado</span><span className="fw-bold text-white" style={{ fontSize: "18px" }}>{formatearPrecio(pedidoSeleccionado.totalAmount)}</span></div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="ord-label mb-2">Artículos a enviar ({pedidoSeleccionado.items?.length || 0})</label>
                                            <div className="ord-mini-table-scroll">
                                                <table className="table table-borderless w-100 mb-0">
                                                    <tbody>
                                                        {(pedidoSeleccionado.items || []).map((item, idx) => (
                                                            <tr key={idx} className="border-bottom-subtle">
                                                                <td className="ps-0 py-2 fw-semibold text-white text-start" style={{ fontSize: '12px', backgroundColor: 'transparent' }}>
                                                                    <div className="text-truncate" style={{ maxWidth: '140px' }}>{nombresProductos[item.productId] || `Prod #${item.productId}`}</div>
                                                                    <div className="d-flex align-items-center gap-2 mt-1"><span className="ord-helper-text m-0">ID: {item.productId}</span><span className="ord-item-badge">Talla: {item.size || item.selectedSize || 'Única'}</span></div>
                                                                </td>
                                                                <td className="text-secondary text-center align-middle py-2" style={{ fontSize: '12px', backgroundColor: 'transparent' }}>x{item.quantity}</td>
                                                                <td className="text-end pe-0 fw-bold text-white align-middle py-2" style={{ fontSize: '13px', backgroundColor: 'transparent' }}>{formatearPrecio((item.unitPrice || item.price) * item.quantity)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

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
                                                        <option value="CANCELLED">CANCELLED (Cancelado)</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <motion.button whileTap={{ scale: 0.95 }} type="submit" className="ord-btn-primary" disabled={loading}>
                                                {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>ACTUALIZANDO...</> : "Guardar Cambio de Estado"}
                                            </motion.button>
                                        </form>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* TARJETA DE TABLA ALINEADA A LA IZQUIERDA */}
                    <motion.div className="col-lg-8" variants={cardVariants}>
                        <div className="ord-card h-100 d-flex flex-column text-start">
                            <div className="ord-card-header d-flex justify-content-between align-items-center">
                                <div><i className="fas fa-list-ul me-2"></i> Historial General</div>
                                <span className="ord-badge badge-light-blue">{pedidos.length} ÓRDENES</span>
                            </div>
                            <div className="ord-table-container flex-grow-1">
                                <table className="ord-table">
                                    <thead>
                                        <tr>
                                            <th className="ps-4 text-start">ID Orden</th>
                                            <th className="text-start">Fecha</th>
                                            <th className="text-start">Monto</th>
                                            <th className="text-start">Estado</th>
                                            <th className="text-end pe-4">Gestión</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {pedidos.map(p => (
                                                <motion.tr key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={pedidoSeleccionado?.id === p.id ? 'active-row' : ''}>
                                                    <td className="ps-4 text-start"><div className="ord-item-name">#{p.id}</div><div className="ord-item-id">User #{p.userId}</div></td>
                                                    <td className="ord-text-muted text-start">{formatearFecha(p.createdAt)}</td>
                                                    <td className="ord-item-price text-start">{formatearPrecio(p.totalAmount)}</td>
                                                    <td className="text-start">{renderBadgeEstado(p.status || p.estado)}</td>
                                                    <td className="text-end pe-4">
                                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="ord-action-btn view" onClick={() => handleVerDetalle(p)} title="Ver detalles"><i className="fas fa-eye"></i></motion.button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                        {pedidos.length === 0 && <tr><td colSpan="5" className="text-center py-5"><div className="ord-empty-state"><i className="fas fa-clipboard-list mb-3"></i><p>No hay pedidos registrados en el sistema.</p></div></td></tr>}
                                    </tbody>
                                </table>
                            </div>
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center align-items-center gap-3 p-3 border-top border-dark" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                    <button className="btn btn-sm btn-outline-light" disabled={currentPage === 0} onClick={() => setCurrentPage(prev => prev - 1)}><i className="fas fa-chevron-left"></i> Anterior</button>
                                    <span className="text-white fw-bold" style={{ fontSize: '12px' }}>Página {currentPage + 1} de {totalPages}</span>
                                    <button className="btn btn-sm btn-outline-light" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(prev => prev + 1)}>Siguiente <i className="fas fa-chevron-right"></i></button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}