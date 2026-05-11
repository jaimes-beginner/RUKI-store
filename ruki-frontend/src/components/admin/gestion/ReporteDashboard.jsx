import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { obtenerProductosActivos } from "../../../services/ProductoService";
import { obtenerUsuarios } from "../../../services/UsuarioService";
import { obtenerPedidoPorId, obtenerTodosLosPedidos } from "../../../services/PedidoService"; 

function normalizeStatus(value) {
    return String(value ?? "")
        .split('"').join("")
        .split("'").join("")
        .trim()
        .toUpperCase();
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
    if (Array.isArray(order?.detalles)) {
        return order.detalles;
    }
    if (Array.isArray(order?.items)) {
        return order.items;
    }
    return [];
}

function getLineTotal(detail, quantity) {
    const subtotal = Number(detail?.subTotal);
    if (Number.isFinite(subtotal)) {
        return subtotal;
    }

    const precioEnCompra = Number(detail?.precioEnCompra);
    if (Number.isFinite(precioEnCompra)) {
        return precioEnCompra * quantity;
    }

    const unitPrice = Number(detail?.unitPrice);
    if (Number.isFinite(unitPrice)) {
        return unitPrice * quantity;
    }

    return 0;
}

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
        if (!String(id).trim()) {
            return;
        }

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
                // Ejecutamos las 3 peticiones en paralelo hacia tus microservicios
                const [prods, usrs, peds] = await Promise.all([
                    obtenerProductosActivos(),
                    obtenerUsuarios(),
                    obtenerTodosLosPedidos(),
                ]);

                if (!activo) {
                    return;
                }

                setProductos(Array.isArray(prods) ? prods : []);
                setUsuarios(Array.isArray(usrs) ? usrs : []);
                setPedidos(Array.isArray(peds) ? peds : []);
            } catch (e) {
                if (!activo) {
                    return;
                }
                setError(e?.message || "No se pudieron cargar los datos del panel.");
            } finally {
                if (activo) {
                    setCargando(false);
                }
            }
        }

        cargarDatos();

        return () => {
            activo = false;
        };
    }, []);

    const {
        totalProductos,
        totalUsuarios,
        productosBajoStock,
        bajoStockCount,
        pctOk,
        pctLow,
        totalPedidos,
        pedidosPendientes,
        ingresosTotales,
        ultimosPedidos,
    } = useMemo(() => {
        const totalProductos = productos.length;

        const productosBajoStock = productos
            .filter((p) => toNumber(p?.stock) < 5)
            .sort((a, b) => toNumber(a?.stock) - toNumber(b?.stock));

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

        const ingresosTotales = pedidos
            .filter((p) => {
                const status = normalizeStatus(p?.estado ?? p?.status);
                return status === "COMPLETADO" || status === "COMPLETED" || status === "DELIVERED";
            })
            .reduce((sum, p) => sum + getOrderTotal(p), 0);

        const ultimosPedidos = [...pedidos]
            .sort((a, b) => toNumber(b?.id) - toNumber(a?.id))
            .slice(0, 5);

        return {
            totalProductos,
            totalUsuarios,
            productosBajoStock,
            bajoStockCount,
            pctOk,
            pctLow,
            totalPedidos,
            pedidosPendientes,
            ingresosTotales,
            ultimosPedidos,
        };
    }, [productos, usuarios, pedidos]);

    return (
        <div className="container px-4 px-md-5 py-2 position-relative" style={{ fontFamily: "'-apple-system', BlinkMacSystemFont, 'Inter', sans-serif" }}>
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

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
                    font-size: 11px;
                    font-weight: 700;
                    border-radius: 8px;
                    padding: 8px 14px;
                    border: 1.5px solid #1d1d1f;
                    transition: all 0.2s;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                }
                .ios-btn-dark { background: #1d1d1f; color: #ffffff; }
                .ios-btn-dark:hover { background: #000000; color: #ffffff; }
                .ios-btn-outline { background: transparent; color: #1d1d1f; }
                .ios-btn-outline:hover { background: #f5f5f7; }
                
                .ios-table-wrapper {
                    border: 1.5px solid #e5e5ea;
                    border-radius: 12px;
                    max-height: 400px; 
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

                /* ESTILO DE BARRA DE PROGRESO TIPO APPLE */
                progress.ios-progress {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 10px;
                }
                progress.ios-progress::-webkit-progress-bar {
                    background-color: #e5e5ea;
                    border-radius: 10px;
                }
                progress.ios-progress::-webkit-progress-value {
                    background-color: #1d1d1f;
                    border-radius: 10px;
                }
                
                /* KPI NUMBERS */
                .kpi-number {
                    font-size: 2.2rem;
                    font-weight: 800;
                    letter-spacing: -0.04em;
                    color: #1d1d1f;
                    line-height: 1;
                }
            `}</style>

            {/* ENCABEZADO */}
            <div className="mb-5 border-bottom border-2 pb-4" style={{ borderColor: "#e5e5ea" }}>
                <h1 className="fw-bolder text-dark mb-1" style={{ letterSpacing: "-0.04em", fontSize: "2.5rem" }}>Centro de Control</h1>
                <p className="text-secondary fw-medium mb-0" style={{ color: "#86868b" }}>Bienvenido, <strong>Administrador</strong>. Resumen global de RUKI.</p>
            </div>

            {/* ALERTAS GLOBALES */}
            {cargando && <div className="alert bg-white border border-dark text-dark fw-bold shadow-sm rounded-3 py-2 px-3 mb-4" style={{ fontSize: "12px" }}><i className="fas fa-spinner fa-spin me-2"></i> Sincronizando datos...</div>}
            {error && <div className="alert bg-white border border-dark text-dark fw-bold shadow-sm rounded-3 py-2 px-3 mb-4" style={{ fontSize: "12px" }}><i className="fas fa-exclamation-triangle me-2"></i> {error}</div>}

            {/* KPIs SECUNDARIOS (3 columnas) */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-md-4">
                    <div className="ios-card p-4 h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="ios-label mb-0">Inventario Total</div>
                                <i className="fas fa-box-open" style={{color: "#d2d2d7", fontSize: "1.2rem"}}></i>
                            </div>
                            <div className="kpi-number mb-1">{totalProductos}</div>
                            <div className="fw-semibold" style={{fontSize: "11px", color: "#86868b"}}>Productos registrados</div>
                        </div>
                        <div className="mt-4">
                            <Link to="/inventario-admin" className="ios-btn ios-btn-outline text-decoration-none d-inline-block text-center w-100">
                                Gestionar
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-4">
                    <div className="ios-card p-4 h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="ios-label mb-0">Base de Usuarios</div>
                                <i className="fas fa-users" style={{color: "#d2d2d7", fontSize: "1.2rem"}}></i>
                            </div>
                            <div className="kpi-number mb-1">{totalUsuarios}</div>
                            <div className="fw-semibold" style={{fontSize: "11px", color: "#86868b"}}>Cuentas activas</div>
                        </div>
                        <div className="mt-4">
                            <Link to="/usuarios-admin" className="ios-btn ios-btn-outline text-decoration-none d-inline-block text-center w-100">
                                Gestionar
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-4">
                    <div className="ios-card p-4 h-100 d-flex flex-column justify-content-between" style={{ borderColor: bajoStockCount > 0 ? "#1d1d1f" : "#e5e5ea" }}>
                        <div>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="ios-label mb-0" style={{color: bajoStockCount > 0 ? "#1d1d1f" : "#86868b"}}>Alerta de Stock</div>
                                <i className="fas fa-exclamation-triangle" style={{color: bajoStockCount > 0 ? "#1d1d1f" : "#d2d2d7", fontSize: "1.2rem"}}></i>
                            </div>
                            <div className="kpi-number mb-1">{bajoStockCount}</div>
                            <div className="fw-semibold" style={{fontSize: "11px", color: "#86868b"}}>Productos en nivel crítico (&lt;5)</div>
                        </div>
                        <div className="mt-4">
                            <Link to="/inventario-admin" className="ios-btn ios-btn-dark text-decoration-none d-inline-block text-center w-100">
                                Revisar Alertas
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPIs PRINCIPALES (2 columnas) */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-md-6">
                    <div className="ios-card p-4 h-100">
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <div className="ios-label mb-3">Pedidos Pendientes</div>
                                <div className="kpi-number mb-2">{pedidosPendientes}</div>
                                <div className="fw-semibold" style={{fontSize: "11px", color: "#86868b"}}>De {totalPedidos} pedidos históricos</div>
                            </div>
                            <div className="d-flex flex-column align-items-end">
                                <i className="fas fa-clock mb-4" style={{color: "#d2d2d7", fontSize: "2rem"}}></i>
                                <Link to="/pedidos-admin" className="ios-btn ios-btn-outline text-decoration-none">
                                    Ver Órdenes
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6">
                    <div className="ios-card p-4 h-100">
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <div className="ios-label mb-3">Ingresos Netos</div>
                                <div className="kpi-number mb-2">{formatearPrecio(ingresosTotales)}</div>
                                <div className="fw-semibold" style={{fontSize: "11px", color: "#86868b"}}>Ventas completadas/entregadas</div>
                            </div>
                            <i className="fas fa-chart-line" style={{color: "#d2d2d7", fontSize: "2rem"}}></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLA DE ÚLTIMOS PEDIDOS Y BUSCADOR */}
            <div className="row g-4 mb-4">
                <div className="col-lg-7">
                    <div className="ios-card h-100 d-flex flex-column">
                        <div className="ios-header d-flex justify-content-between align-items-center">
                            <span>Actividad Reciente</span>
                            <Link to="/pedidos-admin" className="text-dark fw-bold text-decoration-none" style={{fontSize: "11px"}}>VER TODO <i className="fas fa-arrow-right ms-1"></i></Link>
                        </div>
                        <div className="card-body p-3 flex-grow-1">
                            <div className="ios-table-wrapper">
                                <table className="table table-borderless ios-table">
                                    <thead>
                                        <tr>
                                            <th className="ps-3">ID</th>
                                            <th>Fecha</th>
                                            <th>Total</th>
                                            <th className="text-end pe-3">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ultimosPedidos.length > 0 ? (
                                            ultimosPedidos.map((p) => {
                                                const status = normalizeStatus(p?.estado ?? p?.status);
                                                const isDone = status === "COMPLETED" || status === "DELIVERED" || status === "PAID";
                                                const isCanceled = status === "CANCELED";
                                                const orderDate = getOrderDate(p);

                                                return (
                                                    <tr key={p.id}>
                                                        <td className="ps-3 fw-bold text-dark">#{p.id}</td>
                                                        <td className="text-muted fw-medium">
                                                            {orderDate ? new Date(orderDate).toLocaleDateString("es-CL", {day:'2-digit', month:'short'}) : "—"}
                                                        </td>
                                                        <td className="fw-bold text-dark">
                                                            {formatearPrecio(getOrderTotal(p))}
                                                        </td>
                                                        <td className="text-end pe-3">
                                                            {isDone ? (
                                                                <span className="ios-badge badge-ok">OK</span>
                                                            ) : isCanceled ? (
                                                                <span className="ios-badge badge-out">CANCELADO</span>
                                                            ) : (
                                                                <span className="ios-badge badge-low">PENDIENTE</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-4 text-muted fw-bold">
                                                    Sin actividad reciente
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="ios-card h-100 d-flex flex-column">
                        <div className="ios-header">
                            Tracker de Pedidos
                        </div>
                        <div className="card-body p-4">
                            <div className="ios-label mb-2">Búsqueda Directa</div>
                            <div className="d-flex gap-2 mb-4">
                                <input
                                    type="number"
                                    className="ios-input flex-grow-1"
                                    placeholder="Ingresa el ID del pedido..."
                                    value={pedidoId}
                                    onChange={(e) => setPedidoId(e.target.value)}
                                />
                                <button className="ios-btn ios-btn-dark px-3" onClick={() => fetchPedidoPorId(pedidoId)} disabled={cargandoPedido}>
                                    {cargandoPedido ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-search" />}
                                </button>
                            </div>

                            {errorPedido && <div className="alert bg-white border border-dark fw-bold rounded-3 py-2 px-3" style={{ fontSize: "11px" }}>{errorPedido}</div>}

                            {pedidoDetalle && (
                                <div className="p-3" style={{ background: "#fbfbfd", border: "1.5px solid #e5e5ea", borderRadius: "12px" }}>
                                    <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom" style={{borderColor: "#e5e5ea"}}>
                                        <span className="fw-bold text-dark fs-6">Orden #{pedidoDetalle.id}</span>
                                        <span className="fw-bold text-dark fs-6">{formatearPrecio(getOrderTotal(pedidoDetalle))}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="ios-label mb-0">Estado Actual</span>
                                        <span className="fw-bold" style={{fontSize: "11px"}}>{normalizeStatus(pedidoDetalle?.estado ?? pedidoDetalle?.status)}</span>
                                    </div>
                                    
                                    <div className="ios-label mb-2">Resumen de Ítems ({getOrderItems(pedidoDetalle).length})</div>
                                    <div style={{maxHeight: "120px", overflowY: "auto"}}>
                                        <table className="table table-sm table-borderless mb-0" style={{fontSize: "11px"}}>
                                            <tbody>
                                                {getOrderItems(pedidoDetalle).map((d) => {
                                                    const quantity = toNumber(d?.cantidad ?? d?.quantity);
                                                    const lineTotal = getLineTotal(d, quantity);
                                                    const itemKey = String(d?.productoId ?? d?.productId ?? d?.id ?? `item-${quantity}`);
                                                    return (
                                                        <tr key={itemKey} style={{borderBottom: "1px solid #e5e5ea"}}>
                                                            <td className="ps-0 fw-semibold text-dark text-truncate" style={{maxWidth: '150px'}}>
                                                                {productos.find(p => p.id === (d?.productoId ?? d?.productId))?.name || `Prod #${d?.productoId ?? d?.productId}`}
                                                                <div className="text-muted" style={{fontSize: '9px'}}>ID: {d?.productoId ?? d?.productId}</div>
                                                            </td>
                                                            <td className="text-center fw-bold">x{quantity}</td>
                                                            <td className="text-end pe-0 fw-bold text-dark">{formatearPrecio(lineTotal)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* BARRA DE SALUD DEL INVENTARIO */}
            <div className="ios-card p-4">
                <div className="d-flex justify-content-between align-items-end mb-2">
                    <h6 className="fw-bolder text-dark mb-0" style={{ letterSpacing: "-0.02em" }}>Salud del Inventario</h6>
                    <span className="ios-label mb-0">{pctOk}% Óptimo</span>
                </div>
                <p className="fw-medium mb-3" style={{ fontSize: "11px", color: "#86868b" }}>
                    {productosBajoStock.length} productos requieren reabastecimiento (stock menor a 5 unidades).
                </p>
                <progress className="ios-progress" value={pctOk} max="100" />
            </div>

        </div>
    );
}

export default ReporteDashboard;