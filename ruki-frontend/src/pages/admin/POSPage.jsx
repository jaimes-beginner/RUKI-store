import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { obtenerTodosLosProductosAdmin } from '@/services/ProductoService';
import { useAuth } from '@/contexts/AuthContext';
import { crearPedidoFisico } from '@/services/PedidoService'; 
import './POSPage.css'; 

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

export default function POSPage() {
    const { usuario } = useAuth();
    const [productos, setProductos] = useState([]);
    const [carritoPOS, setCarritoPOS] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [alerta, setAlerta] = useState({ visible: false, mensaje: '', tipo: 'success' });
    const [confirmacion, setConfirmacion] = useState({ visible: false, mensaje: '', metodoPago: '' });

    const mostrarAlerta = (mensaje, tipo = 'success') => {
        setAlerta({ visible: true, mensaje, tipo });
        setTimeout(() => setAlerta({ visible: false, mensaje: '', tipo: 'success' }), 4000);
    };

    const productosFiltrados = useMemo(() => {
        if (!busqueda.trim()) return productos;
        return productos.filter(p => p.name.toLowerCase().includes(busqueda.toLowerCase()) || p.id.toString() === busqueda);
    }, [productos, busqueda]);

    const handleProductClick = (producto) => {
        if (producto.stock <= 0) return;
        if (producto.variants && producto.variants.length > 0) {
            setProductoSeleccionado(producto);
        } else {
            agregarAlPOS(producto, 'Única');
        }
    };

    const agregarAlPOS = (producto, tallaElegida) => {
        setCarritoPOS(prev => {
            const itemExistente = prev.find(item => item.id === producto.id && item.size === tallaElegida);
            if (itemExistente) {
                return prev.map(item => (item.id === producto.id && item.size === tallaElegida) ? { ...item, cantidad: item.cantidad + 1 } : item);
            }
            const isSale = producto.sale || producto.isSale;
            const precio = isSale && producto.salePrice ? producto.salePrice : producto.basePrice;
            return [...prev, { ...producto, size: tallaElegida, cantidad: 1, precioFinal: precio }];
        });
    };

    useEffect(() => {
        const cargarCatalogo = async () => {
            try {
                const data = await obtenerTodosLosProductosAdmin();
                const soloActivos = data.filter(prod => prod.active === true);
                setProductos(soloActivos); 
            } catch (error) {
                mostrarAlerta(`Error: ${error.message}`, "error");
            } finally {
                setCargando(false);
            }
        };
        cargarCatalogo();
    }, []);

    const quitarDelPOS = (id, size) => setCarritoPOS(prev => prev.filter(item => !(item.id === id && item.size === size)));

    const mathPOS = useMemo(() => {
        const subtotalNeto = carritoPOS.reduce((sum, item) => sum + (item.precioFinal * item.cantidad), 0);
        const iva = Math.round(subtotalNeto * 0.19);
        return { subtotal: subtotalNeto, iva, total: subtotalNeto + iva, count: carritoPOS.reduce((s, i) => s + i.cantidad, 0) };
    }, [carritoPOS]);

    const iniciarCobro = (metodoPago) => {
        if (carritoPOS.length === 0) { mostrarAlerta("Error: El carrito está vacío", "error"); return; }
        setConfirmacion({ visible: true, mensaje: `¿Confirmar pago de $${mathPOS.total.toLocaleString('es-CL')}?`, metodoPago: metodoPago });
    };

    const ejecutarCobro = async () => {
        const metodo = confirmacion.metodoPago;
        setConfirmacion({ visible: false, mensaje: '', metodoPago: '' }); 
        setProcesando(true);
        try {
            // El backend calcula los precios por seguridad. Solo le enviamos lo estrictamente necesario.
            const payload = {
                items: carritoPOS.map(item => ({ 
                    productId: item.id, 
                    quantity: item.cantidad, 
                    size: item.size 
                }))
            };
            await crearPedidoFisico(payload);
            mostrarAlerta(`Venta en ${metodo} registrada. Stock actualizado.`, "success");
            setCarritoPOS([]); 
            const data = await obtenerTodosLosProductosAdmin();
            setProductos(data.content || data);
        } catch (error) {
            mostrarAlerta(`Error: ${error.message}`, "error");
        } finally {
            setProcesando(false);
        }
    };

    return (
        <div className="pos-wrapper py-4">
            <div className="pos-glow-container">
                <div className="pos-glow-blob pos-blob-green"></div>
                <div className="pos-glow-blob pos-blob-gold"></div>
            </div>

            <div className="pos-toast-container">
                <AnimatePresence>
                    {alerta.visible && (
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -20 }} className={`pos-toast ${alerta.tipo}`}>
                            <i className={`fas ${alerta.tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2 fs-5`}></i>{alerta.mensaje}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {confirmacion.visible && (
                    <div className="pos-modal-backdrop" onClick={() => setConfirmacion({ visible: false, mensaje: '', metodoPago: '' })}>
                        {/* MODAL ALINEADO A LA IZQUIERDA */}
                        <motion.div className="pos-modal-content text-start" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                            <div className="mb-3">
                                <i className={`fas ${confirmacion.metodoPago === 'Efectivo' ? 'fa-money-bill-wave text-success' : 'fa-credit-card text-white'} fa-2x mb-3`}></i>
                                <h4 className="fw-bolder text-white mb-2">Procesar Venta</h4>
                                <p className="text-secondary mb-0">{confirmacion.mensaje}</p>
                            </div>
                            <div className="d-flex gap-2 mt-4">
                                <button className="flex-fill pos-btn-outline" onClick={() => setConfirmacion({ visible: false, mensaje: '', metodoPago: '' })}>Cancelar</button>
                                <button className="flex-fill pos-btn-primary" onClick={ejecutarCobro}>Confirmar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="container-fluid px-3 px-md-5">
                <AnimatePresence>
                    {productoSeleccionado && (
                        <div className="pos-modal-backdrop" onClick={() => setProductoSeleccionado(null)}>
                            {/* MODAL ALINEADO A LA IZQUIERDA */}
                            <motion.div className="pos-modal-content text-start" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="fw-bolder m-0 text-white">Elegir Talla</h5>
                                    <button className="btn-close" onClick={() => setProductoSeleccionado(null)}></button>
                                </div>
                                <div className="d-flex align-items-center mb-4">
                                    <img src={productoSeleccionado.imageUrls?.[0] || '/imagenes/fondo.jpeg'} alt="Prod" style={{width:'50px', height:'50px', objectFit:'cover', borderRadius:'12px', marginRight:'12px', border: '1px solid rgba(255,255,255,0.1)'}} />
                                    <span className="fw-bold text-white small">{productoSeleccionado.name}</span>
                                </div>
                                <p className="small text-secondary mb-2 fw-semibold">Tallas disponibles en sistema:</p>
                                <div className="d-flex flex-wrap gap-2 mb-2">
                                    {productoSeleccionado.variants.map(v => (
                                        <button key={v.size} className="pos-size-btn" disabled={v.stock <= 0} onClick={() => { agregarAlPOS(productoSeleccionado, v.size); setProductoSeleccionado(null); }}>
                                            {v.size} <small className={v.stock > 0 ? 'text-success ms-1' : 'text-danger ms-1'}>({v.stock})</small>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <motion.div className="row g-4 align-items-start" variants={containerVariants} initial="hidden" animate="visible">
                    <motion.div className="col-lg-8" variants={cardVariants}>
                        {/* TARJETA ALINEADA A LA IZQUIERDA */}
                        <div className="pos-card h-100 d-flex flex-column pb-3 text-start">
                            <div className="pos-card-header d-flex justify-content-between align-items-center">
                                <div><i className="fas fa-store me-2 opacity-50"></i> Catálogo Punto de Venta</div>
                                <div className="pos-input-wrapper">
                                    <i className="fas fa-search pos-input-icon"></i>
                                    <input type="text" className="pos-input" placeholder="Buscar por nombre o ID..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} disabled={cargando} />
                                </div>
                            </div>
                            <div className="row g-3 pos-scrollable p-3 p-md-4 flex-grow-1" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                                {cargando ? (
                                    <div className="col-12 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '40vh' }}>
                                        <i className="fas fa-circle-notch fa-spin fa-3x text-white opacity-25 mb-3"></i>
                                        <p className="text-secondary fw-semibold">Sincronizando inventario...</p>
                                    </div>
                                ) : productosFiltrados.length === 0 ? (
                                    <div className="col-12 text-center text-secondary py-5 mt-4">
                                        <i className="fas fa-box-open fa-3x mb-3 opacity-25"></i>
                                        <p className="fw-semibold">No se encontraron productos.</p>
                                    </div>
                                ) : (
                                    productosFiltrados.map(prod => {
                                        const isSale = prod.sale || prod.isSale;
                                        const finalPrice = isSale && prod.salePrice ? prod.salePrice : prod.basePrice;
                                        return (
                                            <div className="col-6 col-md-4 col-xl-3" key={prod.id}>
                                                <motion.div whileTap={{ scale: 0.95 }} className={`pos-product-card h-100 ${prod.stock < 1 ? 'opacity-50' : ''}`} onClick={() => handleProductClick(prod)}>
                                                    <div className="pos-product-img-wrapper">
                                                        <img src={prod.imageUrls?.[0] || '/imagenes/fondo.jpeg'} className="pos-product-img" alt={prod.name} />
                                                        {isSale && <span className="position-absolute top-0 start-0 m-2 badge bg-danger border border-danger">OFERTA</span>}
                                                    </div>
                                                    {/* TEXTOS ALINEADOS A LA IZQUIERDA */}
                                                    <div className="card-body p-3 text-start d-flex flex-column justify-content-between">
                                                        <div>
                                                            <small className="d-block fw-bold text-white text-truncate mb-1">{prod.name}</small>
                                                            {/* DESCRIPCIÓN CON 2 LÍNEAS MÁXIMO */}
                                                            <p className="pos-product-desc">{prod.description || "Equipamiento RUKI."}</p>
                                                        </div>
                                                        <div className="mt-2">
                                                            <span className="text-white fw-bolder fs-6 d-block mb-2">${finalPrice.toLocaleString('es-CL')}</span>
                                                            <div style={{ fontSize: '11px', fontWeight: '700' }}>
                                                                {prod.stock > 0 ? <span className="stock-badge-ok">{prod.stock} disp.</span> : <span className="stock-badge-out">Agotado</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div className="col-lg-4" variants={cardVariants}>
                        {/* TARJETA ALINEADA A LA IZQUIERDA */}
                        <div className="pos-card h-100 d-flex flex-column text-start">
                            <div className="pos-card-header d-flex justify-content-between align-items-center">
                                <div><i className="fas fa-receipt me-2 opacity-50"></i> Ticket de Caja</div>
                                <span className="badge bg-white text-dark rounded-pill px-2 py-1" style={{fontSize: '11px'}}>{mathPOS.count} Ítems</span>
                            </div>
                            <div className="card-body flex-grow-1 pos-scrollable p-0" style={{ maxHeight: '42vh', overflowY: 'auto' }}>
                                <AnimatePresence>
                                    {carritoPOS.length === 0 ? (
                                        <div className="text-center text-secondary my-5 py-5">
                                            <i className="fas fa-barcode fa-3x mb-3 opacity-25"></i>
                                            <p className="fw-medium small">Selecciona productos del catálogo<br/>para iniciar la venta.</p>
                                        </div>
                                    ) : (
                                        carritoPOS.map(item => (
                                            <motion.div key={`${item.id}-${item.size}`} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="d-flex justify-content-between align-items-center p-3 pos-ticket-item">
                                                <div className="text-start" style={{ lineHeight: '1.4' }}>
                                                    <strong className="d-block text-white text-truncate" style={{fontSize: '13px', maxWidth: '160px'}}>{item.name}</strong>
                                                    <small className="text-secondary" style={{ fontSize: '11px', fontWeight: '500' }}>{item.cantidad} x ${item.precioFinal.toLocaleString('es-CL')} <strong className="text-white opacity-75">(Talla: {item.size})</strong></small>
                                                </div>
                                                <div className="d-flex align-items-center gap-3">
                                                    <span className="fw-bolder text-white" style={{fontSize: '14px'}}>${(item.cantidad * item.precioFinal).toLocaleString('es-CL')}</span>
                                                    <button className="btn btn-sm text-danger p-0" onClick={() => quitarDelPOS(item.id, item.size)}><i className="fas fa-minus-circle fs-5"></i></button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="card-footer p-4" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.08)'}}>
                                <div className="d-flex justify-content-between small text-secondary mb-2 fw-semibold"><span>Subtotal (Neto)</span><span className="text-white opacity-75">${mathPOS.subtotal.toLocaleString('es-CL')}</span></div>
                                <div className="d-flex justify-content-between small text-secondary mb-3 fw-semibold"><span>IVA (19%)</span><span className="text-white opacity-75">${mathPOS.iva.toLocaleString('es-CL')}</span></div>
                                <div className="d-flex justify-content-between fw-bolder fs-4 text-white mb-4 pt-3" style={{ borderTop: '2px dashed rgba(255,255,255,0.15)', letterSpacing: '-0.02em' }}><span>TOTAL</span><span>${mathPOS.total.toLocaleString('es-CL')}</span></div>
                                <div className="d-grid gap-2">
                                    <button className="pos-btn-success d-flex justify-content-center align-items-center" disabled={carritoPOS.length === 0 || procesando} onClick={() => iniciarCobro('Efectivo')}>
                                        {procesando ? <i className="fas fa-circle-notch fa-spin me-2"></i> : <i className="fas fa-money-bill-wave me-2"></i>} COBRAR EN EFECTIVO
                                    </button>
                                    <button className="pos-btn-primary d-flex justify-content-center align-items-center" disabled={carritoPOS.length === 0 || procesando} onClick={() => iniciarCobro('Tarjeta')}>
                                        {procesando ? <i className="fas fa-circle-notch fa-spin me-2"></i> : <i className="fas fa-credit-card me-2"></i>} COBRAR CON TARJETA
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}