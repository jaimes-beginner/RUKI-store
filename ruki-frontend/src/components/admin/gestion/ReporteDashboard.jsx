import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { obtenerProductosActivos } from "../../../services/ProductoService";
import { obtenerUsuarios } from "../../../services/UsuarioService";
import { obtenerPedidoPorId, obtenerTodosLosPedidos } from "../../../services/PedidoService"; 
import './ReporteDashboard.css'; 

/* 
    Funciones auxiliares para normalizar datos de pedidos 
*/
function normalizeStatus(value) {
    return String(value ?? "").split('"').join("").split("'").join("").trim().toUpperCase();
}

function toNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
}

function getOrderDate(order) {
    return order?.fechaPedido || order?.createdAt || null;
}

function getOrderTotal(order) {
    return toNumber(order?.montoTotal ?? order?.totalAmount ?? 0);
}

function getOrderItems(order) {
    if (Array.isArray(order?.detalles)) return order.detalles;
    if (Array.isArray(order?.items)) return order.items;
    return [];
}

function getLineTotal(detail, quantity) {
    const subtotal = Number(detail?.subTotal);
    if (Number.isFinite(subtotal)) return subtotal;
    const precioEnCompra = Number(detail?.precioEnCompra);
    if (Number.isFinite(precioEnCompra)) return precioEnCompra * quantity;
    const unitPrice = Number(detail?.unitPrice);
    if (Number.isFinite(unitPrice)) return unitPrice * quantity;
    return 0;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function ReporteDashboard() {
    const [productos, setProductos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [pedidoId, setPedidoId] = useState("");
    const [pedidoDetalle, setPedidoDetalle] = useState(null);
    const [cargandoPedido, setCargandoPedido] = useState(false);
    const [errorPedido, setErrorPedido] = useState(null);

    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0,
        }).format(toNumber(precio));
    };

    async function fetchPedidoPorId(id) {
        if (!String(id).trim()) return;
        try {
            setCargandoPedido(true);
            setErrorPedido(null);
            setPedidoDetalle(null);
            const data = await obtenerPedidoPorId(id);
            setPedidoDetalle(data);
        } catch (e) {
            const msg = e?.status === 404 ? "Pedido no encontrado." : "Error al buscar el pedido.";
            setErrorPedido(msg);
        } finally {
            setCargandoPedido(false);
        }
    }

    useEffect(() => {
        let activo = true;
        async function cargarDatos() {
            setCargando(true);
            setError(null);
            try {
                const [prods, usrs, peds] = await Promise.all([
                    obtenerProductosActivos(),
                    obtenerUsuarios(),
                    obtenerTodosLosPedidos(),
                ]);
                if (!activo) return;
                setProductos(Array.isArray(prods) ? prods : []);
                setUsuarios(Array.isArray(usrs) ? usrs : []);
                setPedidos(Array.isArray(peds) ? peds : []);
            } catch (e) {
                if (!activo) return;
                setError(e?.message || "No se pudieron cargar los datos del panel.");
            } finally {
                if (activo) setCargando(false);
            }
        }
        cargarDatos();
        return () => { activo = false; };
    }, []);

    const {
        totalProductos, totalUsuarios, productosBajoStock, bajoStockCount,
        pctOk, pctLow, totalPedidos, pedidosPendientes, ingresosTotales, ultimosPedidos,
    } = useMemo(() => {
        const totalProductos = productos.length;
        const productosBajoStock = productos.filter((p) => toNumber(p?.stock) < 5).sort((a, b) => toNumber(a?.stock) - toNumber(b?.stock));
        const bajoStockCount = productosBajoStock.length;
        const okStockCount = Math.max(totalProductos - bajoStockCount, 0);
        const pctOk = totalProductos > 0 ? Math.round((okStockCount / totalProductos) * 100) : 0;
        const pctLow = totalProductos > 0 ? Math.round((bajoStockCount / totalProductos) * 100) : 0;
        const totalUsuarios = usuarios.length;
        const totalPedidos = pedidos.length;

        const pedidosPendientes = pedidos.filter((p) => {
            const status = normalizeStatus(p?.estado ?? p?.status);
            return status === "PENDIENTE" || status === "PENDING";
        }).length;

        // SOLUCIÓN: Agregados estados "PAID" y "SHIPPED" para calcular ingresos correctamente
        const ingresosTotales = pedidos.filter((p) => {
            const status = normalizeStatus(p?.estado ?? p?.status);
            return ["COMPLETADO", "COMPLETED", "DELIVERED", "PAID", "SHIPPED"].includes(status);
        }).reduce((sum, p) => sum + getOrderTotal(p), 0);

        const ultimosPedidos = [...pedidos].sort((a, b) => toNumber(b?.id) - toNumber(a?.id)).slice(0, 5);

        return {
            totalProductos, totalUsuarios, productosBajoStock, bajoStockCount,
            pctOk, pctLow, totalPedidos, pedidosPendientes, ingresosTotales, ultimosPedidos,
        };
    }, [productos, usuarios, pedidos]);

    return (
        <div className="admin-dashboard-wrapper">
            <div className="container px-4 px-md-5 py-4">
                
                {/* ENCABEZADO */}
                <motion.div 
                    className="admin-dashboard-header"
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                >
                    <h1 className="admin-title">Centro de Control</h1>
                    <p className="admin-subtitle">Bienvenido, <strong>Administrador</strong>. Resumen global de operaciones RUKI.</p>
                </motion.div>

                {/* ALERTAS GLOBALES */}
                <AnimatePresence>
                    {cargando && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="admin-alert info mb-4">
                            <i className="fas fa-circle-notch fa-spin me-2"></i> Sincronizando red de datos...
                        </motion.div>
                    )}
                    {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="admin-alert error mb-4">
                            <i className="fas fa-exclamation-triangle me-2"></i> {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    
                    {/* KPIs SECUNDARIOS */}
                    <div className="row g-4 mb-4">
                        <motion.div className="col-12 col-md-4" variants={cardVariants}>
                            <motion.div whileHover={{ y: -5 }} className="admin-card h-100 d-flex flex-column justify-content-between">
                                <div>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="admin-label">Inventario Total</div>
                                        <div className="admin-icon"><i className="fas fa-box-open text-primary"></i></div>
                                    </div>
                                    <div className="admin-kpi-number">{totalProductos}</div>
                                    <div className="admin-kpi-subtitle">Productos registrados</div>
                                </div>
                                <div className="mt-4">
                                    <Link to="/inventario-admin" className="admin-btn-outline w-100 text-center">Gestionar Inventario</Link>
                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.div className="col-12 col-md-4" variants={cardVariants}>
                            <motion.div whileHover={{ y: -5 }} className="admin-card h-100 d-flex flex-column justify-content-between">
                                <div>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="admin-label">Base de Usuarios</div>
                                        <div className="admin-icon"><i className="fas fa-users text-info"></i></div>
                                    </div>
                                    <div className="admin-kpi-number">{totalUsuarios}</div>
                                    <div className="admin-kpi-subtitle">Cuentas activas</div>
                                </div>
                                <div className="mt-4">
                                    <Link to="/usuarios-admin" className="admin-btn-outline w-100 text-center">Ver Comunidad</Link>
                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.div className="col-12 col-md-4" variants={cardVariants}>
                            <motion.div whileHover={{ y: -5 }} className={`admin-card h-100 d-flex flex-column justify-content-between ${bajoStockCount > 0 ? 'critical-border' : ''}`}>
                                <div>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className={`admin-label ${bajoStockCount > 0 ? 'text-danger' : ''}`}>Alerta de Stock</div>
                                        <div className={`admin-icon ${bajoStockCount > 0 ? 'critical-icon' : ''}`}>
                                            <i className="fas fa-exclamation-triangle"></i>
                                        </div>
                                    </div>
                                    <div className={`admin-kpi-number ${bajoStockCount > 0 ? 'text-danger' : ''}`}>{bajoStockCount}</div>
                                    <div className="admin-kpi-subtitle">Productos en nivel crítico (&lt;5)</div>
                                </div>
                                <div className="mt-4">
                                    <Link to="/inventario-admin" className={`admin-btn-solid w-100 text-center ${bajoStockCount > 0 ? 'btn-danger' : ''}`}>
                                        Revisar Alertas
                                    </Link>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* KPIs PRINCIPALES */}
                    <div className="row g-4 mb-4">
                        <motion.div className="col-12 col-md-6" variants={cardVariants}>
                            <motion.div whileHover={{ scale: 1.02 }} className="admin-card p-4 h-100 feature-card-1 border-0">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="z-2">
                                        <div className="admin-label text-white opacity-75 mb-3">Pedidos Pendientes</div>
                                        <div className="admin-kpi-number display-1 text-white">{pedidosPendientes}</div>
                                        <div className="admin-kpi-subtitle text-white opacity-75 mt-2">De {totalPedidos} pedidos históricos</div>
                                    </div>
                                    <div className="d-flex flex-column align-items-end z-2">
                                        <div className="admin-icon-large mb-4"><i className="fas fa-clock"></i></div>
                                        <Link to="/pedidos-admin" className="admin-btn-outline text-dark bg-white border-0">Despachar Órdenes</Link>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.div className="col-12 col-md-6" variants={cardVariants}>
                            <motion.div whileHover={{ scale: 1.02 }} className="admin-card p-4 h-100 feature-card-2 border-0">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="z-2">
                                        <div className="admin-label text-white opacity-75 mb-3">Ingresos Netos</div>
                                        <div className="admin-kpi-number display-4 text-white mt-3">{formatearPrecio(ingresosTotales)}</div>
                                        <div className="admin-kpi-subtitle text-white opacity-75 mt-2">Ventas completadas/pagadas</div>
                                    </div>
                                    <div className="z-2">
                                        <div className="admin-icon-large"><i className="fas fa-chart-line"></i></div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* SECCIÓN INFERIOR CON LA TABLA Y UN BUSCADOR */}
                    <div className="row g-4 mb-4">
                        <motion.div className="col-lg-7" variants={cardVariants}>
                            <div className="admin-card h-100 d-flex flex-column">
                                <div className="admin-label d-flex justify-content-between align-items-center mb-3">
                                    <span>Actividad Reciente</span>
                                    <Link to="/pedidos-admin" className="admin-link-accent">VER TODO <i className="fas fa-arrow-right ms-1"></i></Link>
                                </div>
                                <div className="card-body p-0 flex-grow-1">
                                    <div className="admin-table-wrapper">
                                        <table className="table table-borderless admin-table mb-0">
                                            <thead>
                                                <tr>
                                                    <th className="ps-4">ID</th>
                                                    <th>Fecha</th>
                                                    <th>Total</th>
                                                    <th className="text-end pe-4">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ultimosPedidos.length > 0 ? (
                                                    ultimosPedidos.map((p) => {
                                                        const status = normalizeStatus(p?.estado ?? p?.status);
                                                        const isDone = status === "COMPLETED" || status === "DELIVERED" || status === "PAID" || status === "SHIPPED";
                                                        const isCanceled = status === "CANCELED" || status === "CANCELLED";
                                                        const orderDate = getOrderDate(p);
                                                        return (
                                                            <tr key={p.id} className="admin-table-row">
                                                                <td className="ps-4 fw-bold text-dark">#{p.id}</td>
                                                                <td className="text-secondary">
                                                                    {orderDate ? new Date(orderDate).toLocaleDateString("es-CL", {day:'2-digit', month:'short'}) : "—"}
                                                                </td>
                                                                <td className="fw-bold text-dark">{formatearPrecio(getOrderTotal(p))}</td>
                                                                <td className="text-end pe-4">
                                                                    {isDone ? <span className="admin-badge badge-ok">OK</span> : 
                                                                     isCanceled ? <span className="admin-badge badge-out">CANCELADO</span> : 
                                                                     <span className="admin-badge badge-low">PENDIENTE</span>}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr><td colSpan="4" className="text-center py-5 text-muted">Sin actividad reciente</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div className="col-lg-5" variants={cardVariants}>
                            <div className="admin-card h-100 d-flex flex-column">
                                <div className="admin-label mb-3">
                                    <i className="fas fa-crosshairs me-2 text-primary"></i>Tracker de Pedidos
                                </div>
                                <div className="card-body p-0">
                                    <div className="admin-label mb-2 mt-2">Búsqueda Directa por ID</div>
                                    <div className="d-flex gap-2 mb-4">
                                        <div className="admin-input-wrapper flex-grow-1">
                                            <i className="fas fa-search input-icon"></i>
                                            <input
                                                type="number"
                                                className="admin-input w-100"
                                                placeholder="Ej: 15..."
                                                value={pedidoId}
                                                onChange={(e) => setPedidoId(e.target.value)}
                                            />
                                        </div>
                                        <motion.button 
                                            whileTap={{ scale: 0.95 }}
                                            className="admin-btn-solid" 
                                            onClick={() => fetchPedidoPorId(pedidoId)} 
                                            disabled={cargandoPedido}
                                        >
                                            {cargandoPedido ? <i className="fas fa-spinner fa-spin" /> : "Rastrear"}
                                        </motion.button>
                                    </div>

                                    <AnimatePresence>
                                        {errorPedido && (
                                            <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="admin-alert error mb-3">
                                                {errorPedido}
                                            </motion.div>
                                        )}
                                        {pedidoDetalle && (
                                            <motion.div initial={{opacity:0, scale: 0.95}} animate={{opacity:1, scale: 1}} exit={{opacity:0}} className="admin-tracker-result">
                                                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                                    <span className="fw-bold text-dark fs-6">Orden #{pedidoDetalle.id}</span>
                                                    <span className="fw-bold text-accent fs-6">{formatearPrecio(getOrderTotal(pedidoDetalle))}</span>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <span className="admin-label mb-0">Estado Actual</span>
                                                    <span className="admin-badge badge-low">{normalizeStatus(pedidoDetalle?.estado ?? pedidoDetalle?.status)}</span>
                                                </div>
                                                <div className="admin-label mb-2">Ítems ({getOrderItems(pedidoDetalle).length})</div>
                                                <div className="tracker-items-scroll">
                                                    {getOrderItems(pedidoDetalle).map((d) => {
                                                        const quantity = toNumber(d?.cantidad ?? d?.quantity);
                                                        const lineTotal = getLineTotal(d, quantity);
                                                        const itemKey = String(d?.productoId ?? d?.productId ?? d?.id ?? `item-${quantity}`);
                                                        return (
                                                            <div key={itemKey} className="tracker-item-row">
                                                                <div className="tracker-item-name text-truncate">
                                                                    {productos.find(p => p.id === (d?.productoId ?? d?.productId))?.name || `Prod #${d?.productoId ?? d?.productId}`}
                                                                    <div className="text-muted" style={{fontSize: '10px'}}>ID: {d?.productoId ?? d?.productId}</div>
                                                                </div>
                                                                <div className="tracker-item-qty">x{quantity}</div>
                                                                <div className="tracker-item-price">{formatearPrecio(lineTotal)}</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* BARRA DE SALUD DEL INVENTARIO */}
                    <motion.div className="admin-card p-4" variants={cardVariants}>
                        <div className="d-flex justify-content-between align-items-end mb-2">
                            <h6 className="fw-bolder text-dark mb-0" style={{ letterSpacing: "-0.02em" }}>Salud del Inventario Global</h6>
                            <span className="admin-label text-success mb-0">{pctOk}% Óptimo</span>
                        </div>
                        <p className="fw-medium mb-3" style={{ fontSize: "13px", color: "#86868b" }}>
                            {productosBajoStock.length} productos requieren reabastecimiento (stock &lt; 5 unidades).
                        </p>
                        <div className="admin-progress-bg">
                            <motion.div 
                                className="admin-progress-fill" 
                                initial={{ width: 0 }}
                                animate={{ width: `${pctOk}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            ></motion.div>
                        </div>
                    </motion.div>

                </motion.div>
            </div>
        </div>
    );
}

export default ReporteDashboard;