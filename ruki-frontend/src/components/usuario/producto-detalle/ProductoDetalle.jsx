import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { obtenerProductoPorId } from '../../../services/ProductoService';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductoDetalle.css';

export function ProductoDetalle() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imagenPrincipal, setImagenPrincipal] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });

    const mostrarToast = (mensaje, tipo) => {
        setToast({ mostrar: true, mensaje, tipo });
        setTimeout(() => setToast(prev => ({ ...prev, mostrar: false })), 3000);
    };

    useEffect(() => {
        const cargarProducto = async () => {
            try {
                const data = await obtenerProductoPorId(id);
                setProducto(data);
                setImagenPrincipal(data.imageUrls?.length > 0 ? data.imageUrls[0] : 'https://placehold.co/600x800/f5f5f7/86868b?text=Sin+Imagen');
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarProducto();
    }, [id]);

    // Variantes de animación
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    const imageVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
    };

    if (loading) return (
        <div className="product-loading-screen">
            <i className="fas fa-circle-notch fa-spin fa-3x text-dark"></i>
        </div>
    );
    
    if (error) return (
        <div className="product-error-screen">
            <h3>{error}</h3>
            <button className="ios-btn-outline mt-3" onClick={() => navigate('/productos')}>Volver</button>
        </div>
    );

    return (
        <main className="product-detail-main">
            <div className="container py-3 py-md-5 mt-md-3">
                
                {/* BOTÓN VOLVER SUTIL */}
                <button className="btn-back-subtle" onClick={() => navigate(-1)}>
                    <i className="fas fa-chevron-left me-2"></i> Volver al catálogo
                </button>

                {/* LAYOUT PRINCIPAL DEL PRODUCTO */}
                <div className="row g-4 g-lg-5 align-items-start product-card-container">
                    
                    {/* COLUMNA IZQUIERDA | IMAGEN PRINCIPAL Y GALERÍA */}
                    <div className="col-12 col-md-6 col-lg-6 px-0 px-md-3">
                        <motion.div 
                            className="main-image-wrapper mb-3"
                            variants={imageVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <img src={imagenPrincipal} alt={producto.name} className="main-product-image" />
                            
                            {producto.stock === 0 && (
                                <span className="out-of-stock-badge">AGOTADO</span>
                            )}
                        </motion.div>

                        {/* MINIATURAS CON SCROLL TÁCTIL OCULTO */}
                        {producto.imageUrls?.length > 1 && (
                            <motion.div 
                                className="thumbnail-gallery-container scrollbar-hidden"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                            >
                                {producto.imageUrls.map((img, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`thumb-galeria ${imagenPrincipal === img ? 'active' : ''}`} 
                                        onClick={() => setImagenPrincipal(img)}
                                    >
                                        <img src={img} alt={`miniatura ${idx + 1}`} />
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* COLUMNA DERECHA: INFO Y ACCIONES */}
                    <motion.div 
                        className="col-12 col-md-6 col-lg-5 offset-lg-1 d-flex flex-column pt-0 pt-md-3 px-0 px-md-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        
                        <motion.h1 className="product-title" variants={itemVariants}>
                            {producto.name}
                        </motion.h1>
                        
                        <motion.p className="product-price" variants={itemVariants}>
                            ${Number(producto.basePrice).toLocaleString('es-CL')}
                        </motion.p>
                        
                        <motion.hr className="product-divider" variants={itemVariants} />

                        <motion.div className="mb-4" variants={itemVariants}>
                            <p className="product-description">
                                {producto.description || "No hay información adicional disponible para este producto."}
                            </p>
                        </motion.div>

                        {/* SECTOR DE ACCIONES (Solo si hay stock) */}
                        {producto.stock > 0 && (
                            <motion.div className="mb-4" variants={itemVariants}>
                                <p className="product-qty-label">Selecciona la cantidad:</p>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="qty-capsule">
                                        <button className="qty-capsule-btn" onClick={() => setCantidad(Math.max(1, cantidad - 1))} disabled={cantidad <= 1}>
                                            <i className="fas fa-minus"></i>
                                        </button>
                                        <span className="qty-capsule-value">{cantidad}</span>
                                        <button className="qty-capsule-btn" onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))} disabled={cantidad >= producto.stock}>
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    </div>
                                    <span className="stock-warning">
                                        {producto.stock} disponibles
                                    </span>
                                </div>
                            </motion.div>
                        )}

                        <div style={{ flexGrow: 1 }}></div>

                        {/* BOTÓN AÑADIR AL CARRITO */}
                        <motion.div className="mt-3 mt-md-4" variants={itemVariants}>
                            <button 
                                className="ios-btn-dark w-100" 
                                disabled={producto.stock === 0}
                                onClick={() => {
                                    addToCart(producto, cantidad);
                                    mostrarToast(`¡${cantidad}x ${producto.name} añadido al carrito!`, 'success');
                                }}
                            >
                                {producto.stock === 0 ? 'FUERA DE STOCK' : 'AÑADIR AL CARRITO'}
                            </button>
                            
                            <p className="shipping-info">
                                <i className="fas fa-truck me-2"></i> Envío calculado en el checkout.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* TOAST FLOTANTE ANIMADO CON FRAMER-MOTION */}
            <div className="toast-fixed-container">
                <AnimatePresence>
                    {toast.mostrar && (
                        <motion.div 
                            className="ios-toast-notification"
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                            <i className="fas fa-check-circle text-success fs-4 me-3"></i>
                            <div className="toast-body-text">
                                {toast.mensaje}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}