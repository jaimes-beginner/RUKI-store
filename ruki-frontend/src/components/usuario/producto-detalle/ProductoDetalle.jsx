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
    
    const [selectedVariant, setSelectedVariant] = useState(null);
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
                
                if (data.variants && data.variants.length > 0) {
                    const firstAvailable = data.variants.find(v => v.stock > 0);
                    if (firstAvailable) setSelectedVariant(firstAvailable);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarProducto();
    }, [id]);

    const currentStock = producto?.variants?.length > 0 
        ? (selectedVariant ? selectedVariant.stock : 0) 
        : producto?.stock;

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

    const handleAddToCart = () => {
        if (producto.variants?.length > 0 && !selectedVariant) {
            mostrarToast('Por favor, selecciona una talla antes de añadir al carrito', 'error');
            return;
        }

        const productForCart = {
            ...producto,
            selectedSize: selectedVariant ? selectedVariant.size : 'Única',
            cartPrice: producto.sale ? producto.salePrice : producto.basePrice
        };

        addToCart(productForCart, cantidad);
        mostrarToast(`¡${cantidad}x ${producto.name} añadido!`, 'success');
        setCantidad(1);
    };

    if (loading) return (
        <div className="product-loading-screen d-flex justify-content-center align-items-center min-vh-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin-animation">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
        </div>
    );
    
    if (error) return (
        <div className="product-error-screen d-flex flex-column justify-content-center align-items-center min-vh-100 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h3>{error}</h3>
            <button className="ios-btn-outline mt-4" onClick={() => navigate('/productos')}>Volver al catálogo</button>
        </div>
    );

    return (
        <main className="product-detail-main pb-5">
            <div className="container py-3 py-md-5 mt-md-3">
                
                {/* BOTÓN VOLVER CON SVG */}
                <button className="btn-back-subtle mb-4" onClick={() => navigate(-1)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    Volver al catálogo
                </button>

                <div className="row g-4 g-lg-5 align-items-start product-card-container">
                    
                    {/* COLUMNA IZQUIERDA | IMÁGENES */}
                    <div className="col-12 col-md-6 col-lg-6 px-0 px-md-3">
                        <motion.div 
                            className="main-image-wrapper mb-3 position-relative"
                            variants={imageVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="position-absolute top-0 start-0 p-3 d-flex flex-column gap-2" style={{ zIndex: 2 }}>
                                {producto.sale && (
                                    <span className="badge bg-danger shadow-sm fs-6 px-3 py-2 rounded-1" style={{letterSpacing: '1px'}}>SALE</span>
                                )}
                            </div>

                            <img src={imagenPrincipal} alt={producto.name} className="main-product-image" />
                            
                            {producto.stock === 0 && (
                                <span className="out-of-stock-badge">AGOTADO GLOBALMENTE</span>
                            )}
                        </motion.div>

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

                    {/* COLUMNA DERECHA | INFO */}
                    <motion.div 
                        className="col-12 col-md-6 col-lg-5 offset-lg-1 d-flex flex-column pt-0 pt-md-3 px-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.small className="text-muted fw-bold text-uppercase mb-2 d-block" style={{letterSpacing: '2px', fontSize: '12px'}} variants={itemVariants}>
                            {producto.category?.name || "Categoría"}
                        </motion.small>

                        <motion.h1 className="product-title mb-3" variants={itemVariants}>
                            {producto.name}
                        </motion.h1>
                        
                        <motion.div className="mb-4" variants={itemVariants}>
                            {producto.sale ? (
                                <div className="d-flex align-items-center gap-3">
                                    <span className="text-danger fw-bold fs-2">${Number(producto.salePrice).toLocaleString('es-CL')}</span>
                                    <span className="text-muted text-decoration-line-through fs-4">${Number(producto.basePrice).toLocaleString('es-CL')}</span>
                                </div>
                            ) : (
                                <span className="fw-bold fs-2 text-dark">${Number(producto.basePrice).toLocaleString('es-CL')}</span>
                            )}
                        </motion.div>
                        
                        <motion.hr className="product-divider" variants={itemVariants} />

                        <motion.div className="mb-4" variants={itemVariants}>
                            <p className="product-description">
                                {producto.description || "No hay información adicional disponible para este producto."}
                            </p>
                        </motion.div>

                        {/* TALLAS */}
                        {producto.variants && producto.variants.length > 0 && (
                            <motion.div className="mb-4" variants={itemVariants}>
                                <div className="d-flex justify-content-between align-items-end mb-3">
                                    <p className="product-qty-label mb-0">Talla Seleccionada: <span className="text-dark fw-bold">{selectedVariant?.size || 'Ninguna'}</span></p>
                                </div>
                                <div className="d-flex flex-wrap gap-2">
                                    {producto.variants.map(variant => (
                                        <button
                                            key={variant.id}
                                            className={`size-selector-btn ${selectedVariant?.id === variant.id ? 'active' : ''} ${variant.stock === 0 ? 'disabled' : ''}`}
                                            disabled={variant.stock === 0}
                                            onClick={() => {
                                                setSelectedVariant(variant);
                                                setCantidad(1);
                                            }}
                                        >
                                            {variant.size}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* CANTIDAD CON SVGs */}
                        {currentStock > 0 && (
                            <motion.div className="mb-4" variants={itemVariants}>
                                <p className="product-qty-label mb-3">Cantidad:</p>
                                <div className="d-flex align-items-center gap-4">
                                    <div className="qty-capsule">
                                        <button className="qty-capsule-btn" onClick={() => setCantidad(Math.max(1, cantidad - 1))} disabled={cantidad <= 1}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                        </button>
                                        <span className="qty-capsule-value">{cantidad}</span>
                                        <button className="qty-capsule-btn" onClick={() => setCantidad(Math.min(currentStock, cantidad + 1))} disabled={cantidad >= currentStock}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                        </button>
                                    </div>
                                    <span className="stock-warning">
                                        {currentStock} unidades disponibles
                                    </span>
                                </div>
                                {currentStock <= 5 && (
                                    <small className="text-danger fw-bold d-flex align-items-center mt-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
                                        ¡Apúrate, quedan pocas unidades!
                                    </small>
                                )}
                            </motion.div>
                        )}

                        <div style={{ flexGrow: 1 }}></div>

                        {/* ACCIONES Y GARANTÍAS CON SVGs */}
                        <motion.div className="mt-4 pt-2" variants={itemVariants}>
                            <button 
                                className="ios-btn-dark w-100 py-3 mb-4" 
                                disabled={currentStock === 0 || (producto.variants?.length > 0 && !selectedVariant)}
                                onClick={handleAddToCart}
                            >
                                {producto.stock === 0 ? 'AGOTADO GLOBALMENTE' 
                                  : currentStock === 0 ? 'TALLA AGOTADA' 
                                  : 'AÑADIR AL CARRITO'}
                            </button>
                            
                            <div className="shipping-info-box">
                                <div className="shipping-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                                    <span>      Envío rápido y seguro a todo Chile.</span>
                                </div>
                                <div className="shipping-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                    <span>      Retiro en tienda gratuito.</span>
                                </div>
                                <div className="shipping-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                    <span>      Pago 100% seguro garantizado.</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* TOAST FLOTANTE ANIMADO */}
            <div className="toast-fixed-container">
                <AnimatePresence>
                    {toast.mostrar && (
                        <motion.div 
                            className={`ios-toast-notification ${toast.tipo === 'error' ? 'error' : 'success'}`}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                            {toast.tipo === 'error' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-3"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            )}
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