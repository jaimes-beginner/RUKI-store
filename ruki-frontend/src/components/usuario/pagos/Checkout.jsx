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
                    quantity: item.quantity
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

    // Animaciones
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
                    <i className="fas fa-shopping-basket fa-3x text-secondary"></i>
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
        <motion.div 
            className="container mt-5 mb-5 checkout-wrapper"
            initial="hidden" animate="visible" variants={pageVariants}
        >
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h2 className="fw-bolder m-0">Finalizar Compra</h2>
                <span className="secure-badge"><i className="fas fa-lock me-1"></i> Checkout Seguro</span>
            </div>
            
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="alert alert-danger fw-bold small ios-alert"
                    >
                        <i className="fas fa-exclamation-circle me-2"></i>{error}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="row gap-4 gap-lg-0">
                {/* COLUMNA IZQUIERDA: Dirección y Datos */}
                <div className="col-lg-7 pe-lg-4">
                    <div className="checkout-card mb-4">
                        <div className="d-flex align-items-center mb-4">
                            <div className="step-number">1</div>
                            <h5 className="fw-bold m-0 ms-3">Datos de Contacto</h5>
                        </div>
                        <div className="contact-info-box">
                            <p className="m-0 fw-medium">{usuario?.firstName} {usuario?.lastName}</p>
                            <p className="m-0 text-secondary small">{usuario?.email}</p>
                        </div>
                    </div>

                    <div className="checkout-card mb-4">
                        <div className="d-flex align-items-center mb-4">
                            <div className="step-number">2</div>
                            <h5 className="fw-bold m-0 ms-3">Dirección de Envío</h5>
                        </div>
                        
                        {direcciones.length === 0 ? (
                            <div className="alert alert-warning small ios-alert">
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
                                            <div className="address-details">
                                                <p className="fw-bold mb-1"><i className="fas fa-map-marker-alt text-secondary me-2"></i>{dir.direccion}</p>
                                                <p className="small text-secondary mb-0 ms-4">{dir.comuna}, {dir.region}</p>
                                            </div>
                                            <div className="radio-circle">
                                                {direccionSeleccionada === dir.id && <div className="radio-inner"></div>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: Resumen del Carrito */}
                <div className="col-lg-5">
                    <div className="checkout-card summary-card sticky-top" style={{ top: '140px' }}>
                        <h5 className="fw-bold mb-4">Resumen del Pedido</h5>
                        
                        <div className="summary-items-container mb-4">
                            {cart.map((item, index) => (
                                <motion.div 
                                    key={item.id} 
                                    className="d-flex align-items-center summary-item"
                                    custom={index}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="summary-img-wrapper position-relative">
                                        <img src={item.imageUrls?.[0] || 'https://via.placeholder.com/60'} alt={item.name} />
                                        <span className="summary-item-qty">{item.quantity}</span>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <p className="fw-semibold mb-0 small">{item.name}</p>
                                        <p className="text-secondary small m-0">${Number(item.basePrice).toLocaleString('es-CL')}</p>
                                    </div>
                                    <div className="fw-bold small">
                                        ${(item.basePrice * item.quantity).toLocaleString('es-CL')}
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
                                <span>Calculado en el siguiente paso</span>
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
                                <><i className="fab fa-stripe fa-lg me-2"></i> Pagar con Stripe</>
                            )}
                        </button>
                        
                        <p className="text-center small text-secondary mt-3 mb-0">
                            <i className="fas fa-shield-alt me-1"></i> Tus pagos están cifrados y seguros.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}