import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerProductos } from "../../../services/ProductoService";
import { obtenerUsuarios } from "../../../services/UsuarioService";
import {
	obtenerPedidoPorId,
	obtenerTodosLosPedidos,
} from "../../../services/pedidoService";

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
				const [prods, usrs, peds] = await Promise.all([
					obtenerProductos(),
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
		<div className="container my-4" style={{ maxWidth: "1400px" }}>
			<div className="card my-5 mx-auto border-dark rounded shadow">
				<div className="card-body text-center py-5">
					<h1 className="mb-3 reporte-titulo">Panel de Administrador RUKI</h1>
					<p className="lead">
						Bienvenido, <strong>Administrador</strong>.
					</p>
				</div>
			</div>

			{cargando && <div className="alert alert-info">Cargando datos del panel...</div>}
			{error && <div className="alert alert-danger">{error}</div>}

			<div className="row g-4 mb-4">
				<div className="col-12 col-md-4">
					<div className="card border h-100 border-dark rounded shadow">
						<div className="card-body">
							<div className="d-flex justify-content-between align-items-center">
								<h6 className="text-muted mb-2">Productos en Inventario</h6>
								<i className="fas fa-box-open fs-4 text-secondary" />
							</div>
							<h2 className="mb-0">{totalProductos}</h2>
							<div className="mt-3">
								<Link to="/inventario-admin" className="btn btn-sm btn-dark">
									Ver inventario
								</Link>
							</div>
						</div>
					</div>
				</div>

				<div className="col-12 col-md-4">
					<div className="card border h-100 border-dark rounded shadow">
						<div className="card-body">
							<div className="d-flex justify-content-between align-items-center">
								<h6 className="text-muted mb-2">Usuarios Registrados</h6>
								<i className="fas fa-users fs-4 text-secondary" />
							</div>
							<h2 className="mb-0">{totalUsuarios}</h2>
							<div className="mt-3">
								<Link to="/usuarios-admin" className="btn btn-sm btn-dark">
									Ver usuarios
								</Link>
							</div>
						</div>
					</div>
				</div>

				<div className="col-12 col-md-4">
					<div className="card border h-100 border-dark rounded shadow">
						<div className="card-body">
							<div className="d-flex justify-content-between align-items-center">
								<h6 className="text-muted mb-2">Alerta de Stock</h6>
								<i className="fas fa-exclamation-triangle fs-4 text-warning" />
							</div>
							<h2 className="mb-0">{bajoStockCount}</h2>
							<p className="text-muted mb-2">Productos criticos</p>
						</div>
					</div>
				</div>
			</div>

			<div className="row g-4 mb-4">
				<div className="col-12 col-md-6">
					<div className="card border h-100 border-dark rounded shadow">
						<div className="card-body">
							<div className="d-flex justify-content-between align-items-center">
								<div>
									<h6 className="text-muted mb-2">Pedidos Pendientes</h6>
									<h2 className="mb-0 text-warning">{pedidosPendientes}</h2>
									<small className="text-muted">De {totalPedidos} pedidos totales</small>
								</div>
								<i className="fas fa-clock fs-1 text-warning opacity-50" />
							</div>
							<div className="mt-3">
								<Link to="/pedidos-admin" className="btn btn-sm btn-dark">
									Gestionar Pedidos
								</Link>
							</div>
						</div>
					</div>
				</div>

				<div className="col-12 col-md-6">
					<div className="card border h-100 border-dark rounded shadow">
						<div className="card-body">
							<div className="d-flex justify-content-between align-items-center">
								<div>
									<h6 className="text-muted mb-2">Ingresos Totales</h6>
									<h2 className="mb-0 text-success">{formatearPrecio(ingresosTotales)}</h2>
									<small className="text-muted">Pedidos entregados/completados</small>
								</div>
								<i className="fas fa-dollar-sign fs-1 text-success opacity-50" />
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="row g-4">
				<div className="col-lg-6">
					<div className="card border border-dark rounded shadow h-100">
						<div className="card-header bg-white d-flex justify-content-between align-items-center">
							<h6 className="m-0 fw-bold">Ultimos Pedidos</h6>
							<Link to="/pedidos-admin" className="btn btn-sm btn-outline-dark">
								Ver todos
							</Link>
						</div>
						<div className="card-body p-0">
							<div className="table-responsive">
								<table className="table table-sm table-hover align-middle mb-0">
									<thead className="table-light">
										<tr>
											<th className="ps-3">ID</th>
											<th>Fecha</th>
											<th>Total</th>
											<th className="text-center">Estado</th>
										</tr>
									</thead>
									<tbody>
										{ultimosPedidos.length > 0 ? (
											ultimosPedidos.map((p) => {
												const status = normalizeStatus(p?.estado ?? p?.status);
												const isDone =
													status === "COMPLETED" ||
													status === "COMPLETADO" ||
													status === "DELIVERED";
												const orderDate = getOrderDate(p);

												return (
													<tr key={p.id}>
														<td className="ps-3 fw-bold">#{p.id}</td>
														<td className="small">
															{orderDate
																? new Date(orderDate).toLocaleDateString("es-CL")
																: "-"}
														</td>
														<td className="fw-bold text-success">
															{formatearPrecio(getOrderTotal(p))}
														</td>
														<td className="text-center">
															{isDone ? (
																<span
																	className="badge bg-success text-white"
																	style={{ fontSize: "0.7rem" }}
																>
																	OK
																</span>
															) : (
																<span
																	className="badge bg-warning text-dark"
																	style={{ fontSize: "0.7rem" }}
																>
																	Pending
																</span>
															)}
														</td>
													</tr>
												);
											})
										) : (
											<tr>
												<td colSpan="4" className="text-center py-3 text-muted">
													Sin pedidos recientes
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				<div className="col-lg-6">
					<div className="card border border-dark rounded shadow h-100">
						<div className="card-header bg-white">
							<h6 className="m-0 fw-bold">Busqueda Rapida</h6>
						</div>
						<div className="card-body">
							<div className="d-flex gap-2 mb-3">
								<input
									type="number"
									className="form-control form-control-sm"
									placeholder="ID de pedido"
									value={pedidoId}
									onChange={(e) => setPedidoId(e.target.value)}
								/>
								<button
									className="btn btn-sm btn-dark"
									onClick={() => fetchPedidoPorId(pedidoId)}
									disabled={cargandoPedido}
								>
									{cargandoPedido ? (
										<i className="fas fa-spinner fa-spin" />
									) : (
										<i className="fas fa-search" />
									)}
								</button>
							</div>

							{errorPedido && <div className="alert alert-danger py-2 small">{errorPedido}</div>}

							{pedidoDetalle ? (
								<div className="border rounded p-3 bg-light">
									<div className="d-flex justify-content-between align-items-center mb-2">
										<span className="badge bg-dark">ID #{pedidoDetalle.id}</span>
										<span className="fw-bold text-success">
											{formatearPrecio(getOrderTotal(pedidoDetalle))}
										</span>
									</div>
									<div className="small text-muted mb-2">
										Estado: <strong>{normalizeStatus(pedidoDetalle?.estado ?? pedidoDetalle?.status)}</strong>
									</div>

									<div className="table-responsive bg-white border rounded">
										<table className="table table-sm mb-0">
											<tbody>
												{getOrderItems(pedidoDetalle).length > 0 ? (
													getOrderItems(pedidoDetalle).map((d) => {
														const quantity = toNumber(d?.cantidad ?? d?.quantity);
														const lineTotal = getLineTotal(d, quantity);
														const itemKey = String(d?.productoId ?? d?.productId ?? d?.id ?? d?.nombre ?? d?.name ?? `item-${quantity}`);

														return (
															<tr key={itemKey}>
																<td className="small">ID {d?.productoId ?? d?.productId}</td>
																<td className="small text-center">x{quantity}</td>
																<td className="small text-end">
																	{formatearPrecio(lineTotal)}
																</td>
															</tr>
														);
													})
												) : (
													<tr>
														<td className="small text-center text-muted py-3">
															Este pedido no tiene detalles.
														</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>
								</div>
							) : null}
						</div>
					</div>
				</div>
			</div>

			<div className="card border mt-4 border-dark rounded shadow">
				<div className="card-body">
					<h6 className="text-muted mb-2">Salud del Inventario</h6>
					<p className="small text-muted mb-3">{productosBajoStock.length} productos con stock menor a 5.</p>
							<progress className="w-100 admin-inventory-progress" value={pctOk} max="100" />
					<div className="d-flex justify-content-between small text-muted mt-2">
						<span>{pctOk}% OK</span>
						<span>{pctLow}% Bajo</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ReporteDashboard;
