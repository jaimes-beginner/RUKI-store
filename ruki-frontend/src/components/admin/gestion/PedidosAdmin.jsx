import { useState, useEffect } from "react";
import { obtenerTodosLosPedidos, actualizarEstadoPedido } from "../../../services/PedidoService"; 
import { obtenerProductoPorId } from "../../../services/ProductoService";

export function PedidosAdmin() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "success" });
    
    // Diccionario para los nombres de los productos
    const [nombresProductos, setNombresProductos] = useState({});

    // Estado para el pedido que el admin seleccione para ver detalles
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

            // MAGIA: Extraer IDs y buscar nombres para el Admin
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
            return <span className="ios-badge badge-ok">{s}</span>;
        }
        if (s === 'CANCELED' || s === 'CANCELLED') {
            return <span className="ios-badge badge-out">CANCELADO</span>;
        }
        return <span className="ios-badge badge-low">{s}</span>;
    };

    return (
        <div className="container mt-2 position-relative" style={{ fontFamily: "'-apple-system', BlinkMacSystemFont, 'Inter', sans-serif" }}>
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

                body { background-color: #f5f5f7 !important; font-family: 'Inter', sans-serif !important; }
                
                .ios-card {
                    background: #ffffff;
                    border: 2px solid #e5e5ea;
                    border-radius: 16px;
                    transition: all 0.2s ease;
                }
                .ios-card:hover {
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);
                }
                .ios-header {
                    border-bottom: 1.5px solid #e5e5ea;
                    padding: 12px 16px;
                    font-weight: 700;
                    color: #1d1d1f;
                    font-size: 14px;
                    letter-spacing: -0.01em;
                }
                .ios-label {
                    font-size: 11px;
                    font-weight: 700;
                    color: #86868b;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin-bottom: 4px;
                }
                .ios-input {
                    font-family: 'Inter', sans-serif !important;
                    font-size: 12px !important;
                    background: #fbfbfd;
                    border: 1.5px solid #d2d2d7;
                    border-radius: 10px;
                    color: #1d1d1f;
                    padding: 8px 12px;
                    transition: all 0.2s;
                }
                .ios-input:focus {
                    background: #ffffff;
                    border-color: #1d1d1f;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
                }
                .ios-btn {
                    font-family: 'Inter', sans-serif !important;
                    font-size: 12px;
                    font-weight: 600;
                    border-radius: 10px;
                    padding: 10px;
                    border: 1.5px solid #1d1d1f;
                    transition: all 0.2s;
                }
                .ios-btn-dark { background: #1d1d1f; color: #ffffff; }
                .ios-btn-dark:hover { background: #000000; color: #ffffff; }
                
                .ios-btn-icon {
                    background: #fbfbfd;
                    color: #1d1d1f;
                    border: 1.5px solid #e5e5ea;
                    border-radius: 8px;
                    width: 28px;
                    height: 28px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    transition: all 0.2s;
                    cursor: pointer;
                }
                .ios-btn-icon:hover {
                    background: #1d1d1f;
                    color: #ffffff;
                    border-color: #1d1d1f;
                }
                
                .ios-table-wrapper {
                    border: 1.5px solid #e5e5ea;
                    border-radius: 12px;
                    max-height: 520px; 
                    overflow-y: auto;
                    overflow-x: auto;
                    background: #ffffff;
                }
                
                .ios-table-wrapper::-webkit-scrollbar { width: 6px; height: 6px; }
                .ios-table-wrapper::-webkit-scrollbar-track { background: transparent; margin: 4px; }
                .ios-table-wrapper::-webkit-scrollbar-thumb { background-color: #d2d2d7; border-radius: 10px; }
                .ios-table-wrapper::-webkit-scrollbar-thumb:hover { background-color: #86868b; }

                .ios-table { margin-bottom: 0; font-size: 12px; min-width: 500px; }
                .ios-table th {
                    position: sticky; top: 0; z-index: 2;
                    background: #fbfbfd; color: #86868b; font-weight: 600;
                    text-transform: uppercase; letter-spacing: 0.04em;
                    border-bottom: 1.5px solid #e5e5ea !important; padding: 10px 16px; white-space: nowrap; 
                }
                .ios-table td {
                    vertical-align: middle; border-bottom: 1px solid #e5e5ea;
                    padding: 10px 16px; color: #1d1d1f; white-space: nowrap; 
                }
                .ios-table tr:last-child td { border-bottom: none; }
                
                .ios-badge {
                    font-family: 'Inter', sans-serif !important;
                    font-size: 10px; font-weight: 700; padding: 4px 8px;
                    border-radius: 6px; border: 1.5px solid; display: inline-block;
                }
                .badge-ok { border-color: #1d1d1f; color: #1d1d1f; }
                .badge-low { border-color: #86868b; color: #86868b; }
                .badge-out { border-color: #1d1d1f; background: #1d1d1f; color: #ffffff; }

                /* Estilo especial para la mini tabla de items del pedido */
                .mini-table td, .mini-table th {
                    padding: 8px 0;
                    font-size: 11px;
                }
            `}</style>

            <div className="mb-5 border-bottom border-2 pb-4" style={{ borderColor: "#e5e5ea" }}>
                <h1 className="fw-bolder text-dark mb-1" style={{ letterSpacing: "-0.04em", fontSize: "2.5rem" }}>Gestión de Pedidos</h1>
                <p className="text-secondary fw-medium mb-0" style={{ color: "#86868b" }}>Recopilación y logística de <strong>pedidos</strong></p>
            </div>

            <div className="row g-4">
                {/* PANEL DE DETALLE Y EDICIÓN DE ESTADO */}
                <div className="col-md-4">
                    <div className="ios-card h-100">
                        <div className="ios-header d-flex justify-content-between align-items-center">
                            <div>
                                <i className="fas fa-box-open me-2"></i> Detalle del Pedido
                            </div>
                            {pedidoSeleccionado && (
                                <span className="badge bg-dark text-white rounded-pill" style={{fontSize: "9px"}}>#{pedidoSeleccionado.id}</span>
                            )}
                        </div>
                        <div className="card-body p-3">
                            {!pedidoSeleccionado ? (
                                <div className="text-center py-5">
                                    <i className="fas fa-hand-pointer fs-1 text-muted opacity-25 mb-3"></i>
                                    <p className="fw-bold text-dark mb-1" style={{fontSize: "12px"}}>Ningún pedido seleccionado</p>
                                    <p className="text-muted" style={{fontSize: "11px"}}>Haz clic en el icono del ojo en la tabla para ver y gestionar los detalles aquí.</p>
                                </div>
                            ) : (
                                <div>
                                    {/* Resumen del Cliente y Fecha */}
                                    <div className="mb-4 pb-3 border-bottom" style={{borderColor: "#e5e5ea"}}>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="ios-label mb-0">Fecha</span>
                                            <span className="fw-bold text-dark" style={{fontSize: "11px"}}>{formatearFecha(pedidoSeleccionado.createdAt)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="ios-label mb-0">ID Cliente</span>
                                            <span className="fw-bold text-dark" style={{fontSize: "11px"}}>Usuario #{pedidoSeleccionado.userId}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="ios-label mb-0">Total Pagado</span>
                                            <span className="fw-bold text-dark" style={{fontSize: "14px"}}>{formatearPrecio(pedidoSeleccionado.totalAmount)}</span>
                                        </div>
                                    </div>

                                    {/* Lista de Ítems (Mini tabla con NOMBRES REALES) */}
                                    <div className="mb-4">
                                        <label className="ios-label">Artículos a enviar ({pedidoSeleccionado.items?.length || 0})</label>
                                        <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                                            <table className="table table-borderless mini-table w-100 mb-0">
                                                <tbody style={{borderTop: "1.5px solid #e5e5ea"}}>
                                                    {(pedidoSeleccionado.items || []).map((item, idx) => (
                                                        <tr key={idx} style={{borderBottom: "1px solid #e5e5ea"}}>
                                                            <td className="fw-semibold text-dark" style={{maxWidth: '120px', whiteSpace: 'normal', lineHeight: '1.2'}}>
                                                                {nombresProductos[item.productId] || `Prod #${item.productId}`}
                                                                <div className="text-muted mt-1" style={{fontSize: '9px'}}>ID: {item.productId}</div>
                                                            </td>
                                                            <td className="text-muted text-center align-middle">x{item.quantity}</td>
                                                            <td className="text-end fw-bold text-dark align-middle">
                                                                {/* Usamos unitPrice para evitar el NaN, o price si así lo guardaste */}
                                                                {formatearPrecio((item.unitPrice || item.price) * item.quantity)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Formulario de Cambio de Estado */}
                                    <form onSubmit={handleActualizarEstado}>
                                        <div className="mb-3">
                                            <label className="ios-label">Actualizar Estado Logístico</label>
                                            <select className="ios-input w-100" value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}>
                                                <option value="PENDING">PENDING (Pendiente de Pago)</option>
                                                <option value="PAID">PAID (Pagado / En Preparación)</option>
                                                <option value="SHIPPED">SHIPPED (Enviado / En camino)</option>
                                                <option value="DELIVERED">DELIVERED (Entregado)</option>
                                                <option value="CANCELED">CANCELED (Cancelado)</option>
                                            </select>
                                        </div>
                                        <button type="submit" className="ios-btn ios-btn-dark w-100" disabled={loading}>
                                            {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>ACTUALIZANDO...</> : "GUARDAR CAMBIO DE ESTADO"}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* TABLA DE TODOS LOS PEDIDOS */}
                <div className="col-md-8">
                    <div className="ios-card h-100 d-flex flex-column">
                        <div className="ios-header d-flex justify-content-between align-items-center">
                            <span>Historial General</span>
                            <span className="ios-badge badge-low" style={{ border: "none", background: "#f5f5f7" }}>
                                {pedidos.length} ÓRDENES
                            </span>
                        </div>
                        <div className="card-body p-3 flex-grow-1">
                            
                            <div className="ios-table-wrapper">
                                <table className="table table-borderless ios-table">
                                    <thead>
                                        <tr>
                                            <th>ID Orden</th>
                                            <th>Fecha</th>
                                            <th>Monto</th>
                                            <th>Estado</th>
                                            <th className="text-end">Gestión</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pedidos.map(p => (
                                            <tr key={p.id} style={{ backgroundColor: pedidoSeleccionado?.id === p.id ? '#f5f5f7' : 'transparent' }}>
                                                <td>
                                                    <div className="fw-bold text-dark">#{p.id}</div>
                                                    <div style={{ fontSize: "10px", color: "#86868b", fontWeight: "600" }}>User #{p.userId}</div>
                                                </td>
                                                <td className="fw-semibold text-muted">
                                                    {formatearFecha(p.createdAt)}
                                                </td>
                                                <td className="fw-bold text-dark">
                                                    {formatearPrecio(p.totalAmount)}
                                                </td>
                                                <td>
                                                    {renderBadgeEstado(p.status || p.estado)}
                                                </td>
                                                <td className="text-end">
                                                    <button type="button" className="ios-btn-icon" title="Ver detalles y gestionar" onClick={() => handleVerDetalle(p)}>
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {pedidos.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5 text-muted fw-bold">
                                                    No hay pedidos en el sistema.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>

            {/* TOAST FLOTANTE */}
            <div className="toast-container position-fixed bottom-0 end-0 p-4" style={{ zIndex: 1050 }}>
                <div className={`toast align-items-center bg-white ${toast.mostrar ? 'show' : 'hide'}`} 
                     role="alert" aria-live="assertive" aria-atomic="true" 
                     style={{ border: '3px solid #1d1d1f', borderRadius: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                    <div className="d-flex p-2">
                        <div className="toast-body fw-bold text-dark" style={{ fontSize: "12px" }}>
                            {toast.tipo === 'success' ? <i className="fas fa-check me-2"></i> : <i className="fas fa-exclamation-triangle text-danger me-2"></i>}
                            {toast.mensaje}
                        </div>
                        <button type="button" className="btn-close me-2 m-auto" onClick={() => setToast({ ...toast, mostrar: false })}></button>
                    </div>
                </div>
            </div>

        </div>
    );
}