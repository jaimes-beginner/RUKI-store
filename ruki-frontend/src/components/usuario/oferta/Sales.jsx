import { useState } from 'react';
import { useCart } from '../../../contexts/CartContext'; 
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Sales.css';

/*
    Mock Data actualizada para funcionar 
    con el Carrito (precios numéricos y stock)
*/
const products = [
    {
        id: 1,
        name: 'Polerón Blackout',
        oldPrice: 19900,
        basePrice: 12900, 
        stock: 8,
        imageUrls: ['/imagenes/wallpaper.jpg', '/imagenes/walpaper 2.jpg', '/imagenes/fondo.jpeg'],
    },
    {
        id: 2,
        name: 'Calcetas Burnout',
        oldPrice: 14900,
        basePrice: 10900,
        stock: 15,
        imageUrls: ['/imagenes/walpaper 2.jpg', '/imagenes/fondo.jpeg'],
    },
    {
        id: 3,
        name: 'Polera Ruki Ghost',
        oldPrice: 17900,
        basePrice: 11900,
        stock: 3,
        imageUrls: ['/imagenes/fondo.jpeg', '/imagenes/wallpaper.jpg'],
    },
    {
        id: 4,
        name: 'Short Endurance',
        oldPrice: 20900,
        basePrice: 13900,
        stock: 20,
        imageUrls: ['/imagenes/wallpaper.jpg', '/imagenes/walpaper 2.jpg'],
    },
    {
        id: 5,
        name: 'Jogger Street Fade',
        oldPrice: 21900,
        basePrice: 14900,
        stock: 0,
        imageUrls: ['/imagenes/walpaper 2.jpg', '/imagenes/fondo.jpeg'],
    },
    {
        id: 6,
        name: 'Mochila Core Sale',
        oldPrice: 24900,
        basePrice: 16900,
        stock: 5,
        imageUrls: ['/imagenes/fondo.jpeg', '/imagenes/wallpaper.jpg'],
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function Sales() {
    const { addToCart } = useCart(); 
    const [selectedImages, setSelectedImages] = useState({});
    const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });

    const mostrarToast = (mensaje, tipo) => {
        setToast({ mostrar: true, mensaje, tipo });
        setTimeout(() => setToast(prev => ({ ...prev, mostrar: false })), 3000);
    };

    const getGallery = (product) => [...new Set(product.imageUrls)];
    const getSelectedIndex = (productId) => selectedImages[productId] ?? 0;

    const handleSelectImage = (productId, imageIndex) => {
        setSelectedImages((current) => ({ ...current, [productId]: imageIndex }));
    };

    const getDisplayImage = (product) => {
        const gallery = getGallery(product);
        const selectedIndex = getSelectedIndex(product.id);
        return gallery[selectedIndex] ?? gallery[0];
    };

    /*
        Calcular el porcentaje de descuento
    */
    const calcularDescuento = (oldPrice, newPrice) => {
        return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
    };

    return (
        <main className="sale-wrapper">
            
            {/* HERO BANNER */}
            <section className="sale-hero-section">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.6 }}
                    className="sale-hero-content"
                >
                    <span className="sale-hero-badge">TIEMPO LIMITADO</span>
                    <h1 className="sale-hero-title">Sale</h1>
                    <p className="sale-hero-subtitle">Rendimiento máximo. Precios mínimos. Renueva tu equipamiento hoy mismo.</p>
                </motion.div>
            </section>

            <div className="container px-4 px-lg-5 pb-5">
                <div className="row g-5">
                    
                    {/* PANEL DE FILTROS LATERAL */}
                    <aside className="col-lg-3 d-none d-lg-block">
                        <div className="sale-filter-sidebar">
                            <h3 className="sale-filter-header">Filtros</h3>
                            
                            <div className="sale-filter-group">
                                <h4 className="sale-filter-title">Categorías</h4>
                                <ul className="sale-filter-list">
                                    <li><button className="active">Ver todo Sale</button></li>
                                    <li><button>Poleras en oferta</button></li>
                                    <li><button>Shorts en oferta</button></li>
                                </ul>
                            </div>

                            <div className="sale-filter-group mt-4">
                                <h4 className="sale-filter-title">Talla</h4>
                                <div className="sale-size-grid">
                                    {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={size} type="button" className="sale-size-btn">
                                            {size}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* ÁREA DE PRODUCTOS */}
                    <div className="col-lg-9">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="fw-semibold text-secondary" style={{fontSize: '14px'}}>Mostrando {products.length} ofertas</span>
                            <select className="sale-sort-select">
                                <option>Mayor Descuento</option>
                                <option>Precio: Menor a Mayor</option>
                                <option>Precio: Mayor a Menor</option>
                            </select>
                        </div>

                        {/* GRILLA ANIMADA */}
                        <motion.div 
                            className="row g-4"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {products.map((product) => (
                                <motion.div key={product.id} className="col-12 col-sm-6 col-md-4" variants={itemVariants}>
                                    <article className="sale-card">
                                        <div className="sale-image-wrap">
                                            
                                            {/* BADGES FLOTANTES */}
                                            <div className="sale-badge-container">
                                                <span className="sale-card-badge accent">
                                                    -{calcularDescuento(product.oldPrice, product.basePrice)}%
                                                </span>
                                            </div>

                                            {/* TRANSICIÓN DE IMÁGENES SUAVE */}
                                            <Link to={`/producto/${product.id}`}>
                                                <AnimatePresence mode="wait">
                                                    <motion.img 
                                                        key={getDisplayImage(product)}
                                                        src={getDisplayImage(product)} 
                                                        alt={product.name}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="sale-main-img"
                                                    />
                                                </AnimatePresence>
                                            </Link>
                                        </div>

                                        <div className="sale-card-info d-flex flex-column h-100">
                                            
                                            {/* MINIATURAS */}
                                            <div className="sale-thumbs">
                                                {getGallery(product).map((thumb, index) => (
                                                    <button
                                                        key={`${product.id}-${index}`}
                                                        type="button"
                                                        className={`sale-thumb-btn ${getSelectedIndex(product.id) === index ? 'is-active' : ''}`}
                                                        onMouseEnter={() => handleSelectImage(product.id, index)}
                                                        onClick={() => handleSelectImage(product.id, index)}
                                                        aria-label={`Mostrar miniatura ${index + 1}`}
                                                    >
                                                        <img src={thumb} alt="miniatura" />
                                                    </button>
                                                ))}
                                            </div>

                                            <h3 className="sale-product-title">{product.name}</h3>
                                            
                                            <div className="sale-price-wrap">
                                                <span className="sale-price-old">${product.oldPrice.toLocaleString('es-CL')}</span>
                                                <span className="sale-price-new">${product.basePrice.toLocaleString('es-CL')}</span>
                                            </div>
                                            
                                            <div style={{ flexGrow: 1 }}></div>

                                            {/* BOTÓN AÑADIR AL CARRITO */}
                                            <motion.button 
                                                whileTap={product.stock > 0 ? { scale: 0.95 } : {}}
                                                className={`sale-btn-primary mt-3 ${product.stock === 0 ? 'disabled' : ''}`}
                                                onClick={() => {
                                                    addToCart(product, 1);
                                                    mostrarToast(`¡${product.name} añadido!`, 'success');
                                                }}
                                                disabled={product.stock === 0}
                                            >
                                                {product.stock === 0 ? (
                                                    <><i className="fas fa-times-circle me-2"></i> AGOTADO</>
                                                ) : (
                                                    <><i className="fas fa-shopping-bag me-2"></i> AÑADIR APROVECHANDO OFERTA</>
                                                )}
                                            </motion.button>
                                        </div>
                                    </article>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* TOAST NOTIFICATION */}
            <div className="sale-toast-container">
                <AnimatePresence>
                    {toast.mostrar && (
                        <motion.div 
                            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
                            animate={{ opacity: 1, y: 0, scale: 1 }} 
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className={`sale-toast ${toast.tipo === 'error' ? 'error' : 'success'}`}
                        >
                            <i className={`fas ${toast.tipo === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'} me-2 fs-5`}></i>
                            {toast.mensaje}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}