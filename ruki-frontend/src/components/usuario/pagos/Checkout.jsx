import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { crearPedido, iniciarPagoStripe } from '../../../services/PedidoService';
import { obtenerDireccionesPorUsuario } from '../../../services/UsuarioService';
import { motion, AnimatePresence } from 'framer-motion';
import './Checkout.css';

export function Checkout() {
    const { cart, cartTotalAmount } = useCart();
    const { usuario } = useAuth();
    const navigate = useNavigate();

    const [direcciones, setDirecciones] = useState([]);
    const [direccionSeleccionada, setDireccionSeleccionada] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!usuario) {
            navigate('/login');
            return;
        }

        const cargarDirecciones = async () => {
            try {
                const data = await obtenerDireccionesPorUsuario(usuario.id);
                setDirecciones(data);
                if (data.length > 0) {
                    setDireccionSeleccionada(data[0].id);
                }
            } catch (err) {
                console.error("No se pudieron cargar las direcciones:", err);
            }
        };
        cargarDirecciones();
    }, [usuario, navigate]);

    const handlePagar = async () => {
        if (cart.length === 0) {
            setError("Tu carrito está vacío.");
            return;
        }
        if (!direccionSeleccionada) {
            setError("Debes seleccionar una dirección de envío.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const orderData = {
                shippingAddressId: parseInt(direccionSeleccionada),
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.cantidad,
                    size: item.selectedSize 
                }))
            };

            const nuevaOrden = await crearPedido(orderData);
            const stripeResponse = await iniciarPagoStripe(nuevaOrden.id);

            if (stripeResponse.url) {
                window.location.href = stripeResponse.url;
            } else {
                throw new Error("Stripe no generó la URL de pago correctamente.");
            }
        } catch (err) {
            setError(err.message || "Ocurrió un error al procesar tu compra.");
            setLoading(false);
        }
    };

    const pageVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 }
    };

    if (cart.length === 0) {
        return (
            <motion.div
                className="container mt-5 text-center checkout-empty"
                initial="hidden" animate="visible" variants={pageVariants}
            >
                <div className="checkout-empty-icon mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-secondary opacity-50">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                </div>
                <h2 className="fw-bolder">Tu carrito está vacío</h2>
                <p className="text-secondary mb-4">Agrega algunos productos increíbles antes de pasar por caja.</p>
                <button className="ios-btn-outline" onClick={() => navigate('/productos')}>
                    Volver a la tienda
                </button>
            </motion.div>
        );
    }

    return (
        <main className="checkout-wrapper">
            <motion.div
                className="container pt-5 pb-5"
                initial="hidden" animate="visible" variants={pageVariants}
            >
                {/* CABECERA */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h2 className="fw-bolder text-dark m-0">Finalizar Compra</h2>
                    <span className="secure-badge d-flex align-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="me-2 text-success">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Checkout Seguro
                    </span>
                </div>

                {/* MENSAJE DE ERROR (ANIMADO) */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="alert ios-alert d-flex align-items-center mb-4 fw-bold small"
                        >
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="row gap-4 gap-lg-0">

                    {/* COLUMNA IZQUIERDA (DATOS Y DIRECCIÓN) */}
                    <div className="col-lg-7 pe-lg-4">

                        {/* PASO 1: DATOS DE CONTACTO */}
                        <div className="checkout-card mb-4">
                            <div className="d-flex align-items-center mb-4">
                                <div className="step-number">1</div>
                                <h5 className="fw-bolder m-0 ms-3 text-dark" style={{ letterSpacing: '-0.02em' }}>Datos de Contacto</h5>
                            </div>

                            <div className="contact-info-box">
                                <div className="d-flex align-items-center">
                                    <div className="bg-white rounded-circle d-flex justify-content-center align-items-center me-3 shadow-sm" style={{ width: '40px', height: '40px' }}>
                                        <i className="fas fa-user text-secondary"></i>
                                    </div>
                                    <div>
                                        <p className="m-0 fw-bold text-dark">{usuario?.firstName} {usuario?.lastName}</p>
                                        <p className="m-0 text-secondary small">{usuario?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PASO 2: DIRECCIÓN DE ENVÍO */}
                        <div className="checkout-card mb-4">
                            <div className="d-flex align-items-center mb-4">
                                <div className="step-number">2</div>
                                <h5 className="fw-bolder m-0 ms-3 text-dark" style={{ letterSpacing: '-0.02em' }}>Dirección de Envío</h5>
                            </div>

                            {direcciones.length === 0 ? (
                                <div className="alert ios-alert small mb-0 d-flex align-items-center">
                                    <i className="fas fa-exclamation-triangle me-2 text-warning"></i>
                                    No tienes direcciones registradas. Por favor, agrega una en tu perfil.
                                </div>
                            ) : (
                                <div className="address-grid">
                                    {direcciones.map(dir => (
                                        <div
                                            key={dir.id}
                                            className={`address-card ${direccionSeleccionada === dir.id ? 'selected' : ''}`}
                                            onClick={() => setDireccionSeleccionada(dir.id)}
                                        >
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <p className="fw-bold mb-1 text-dark d-flex align-items-center">
                                                        <i className="fas fa-map-marker-alt text-secondary me-2"></i>
                                                        {dir.street}
                                                    </p>
                                                    <p className="small text-secondary mb-0 ms-4">
                                                        {dir.city}, {dir.region}
                                                        {dir.zipCode && ` • CP: ${dir.zipCode}`}
                                                    </p>
                                                    {dir.referenceInfo && (
                                                        <p className="small text-muted mb-0 ms-4 mt-1 fst-italic">
                                                            "{dir.referenceInfo}"
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="radio-circle mt-1">
                                                    {direccionSeleccionada === dir.id && <div className="radio-inner"></div>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COLUMNA DERECHA (RESUMEN DEL PEDIDO)        */}
                    <div className="col-lg-5">
                        <div className="checkout-card summary-card sticky-top" style={{ top: '100px' }}>
                            <h5 className="fw-bold mb-4">Resumen del Pedido</h5>

                            <div className="summary-items-container mb-4">
                                {cart.map((item, index) => (
                                    <motion.div
                                        key={item.uniqueId}
                                        className="d-flex align-items-center summary-item"
                                        custom={index}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="summary-img-wrapper position-relative">
                                            <img src={item.imageUrls?.[0] || 'https://via.placeholder.com/60'} alt={item.name} />
                                            <span className="summary-item-qty">
                                                {item.cantidad}
                                            </span>
                                        </div>
                                        <div className="flex-grow-1 ms-3">
                                            <p className="fw-semibold mb-0 small text-dark">{item.name}</p>
                                            <p className="text-secondary small m-0">Talla: {item.selectedSize}</p>
                                        </div>
                                        <div className="fw-bold small text-dark">
                                            ${((Number(item.precioFinal) || Number(item.cartPrice) || Number(item.basePrice) || 0) * item.cantidad).toLocaleString('es-CL')}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="summary-totals border-top pt-3">
                                <div className="d-flex justify-content-between mb-2 small text-secondary">
                                    <span>Subtotal</span>
                                    <span>${cartTotalAmount.toLocaleString('es-CL')}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-3 small text-secondary">
                                    <span>Envío</span>
                                    <span>Calculado en Stripe</span>
                                </div>
                                <div className="d-flex justify-content-between border-top pt-3 mb-4 fw-bolder fs-5 text-dark">
                                    <span>Total</span>
                                    <span>${cartTotalAmount.toLocaleString('es-CL')}</span>
                                </div>
                            </div>

                            <button
                                className="checkout-btn-dark w-100"
                                onClick={handlePagar}
                                disabled={loading || direcciones.length === 0}
                            >
                                {loading ? (
                                    <><i className="fas fa-circle-notch fa-spin me-2"></i> Procesando...</>
                                ) : (
                                    <><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg> Pagar con Stripe</>
                                )}
                            </button>

                            <p className="text-center small text-secondary mt-3 mb-0 d-flex justify-content-center align-items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                Tus pagos están cifrados y seguros.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}