import { useState, useEffect } from 'react';
import { useCart } from '../../../contexts/CartContext'; 
import { obtenerProductosActivos } from '../../../services/ProductoService'; 
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Productos.css';

/*
    Animaciones base para Framer Motion
*/
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function Productos() {
    const { addToCart } = useCart(); 
    const [productosReales, setProductosReales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImages, setSelectedImages] = useState({});
    const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });

    const mostrarToast = (mensaje, tipo) => {
        setToast({ mostrar: true, mensaje, tipo });
        setTimeout(() => setToast({ ...toast, mostrar: false }), 3000);
    };

    useEffect(() => {
        const cargarCatalogo = async () => {
            try {
                const data = await obtenerProductosActivos();
                setProductosReales(data);
            } catch (err) {
                setError(err.message || "Error al cargar el catálogo");
            } finally {
                setLoading(false);
            }
        };
        cargarCatalogo();
    }, []);

    const getGallery = (product) => {
        if (product.imageUrls && product.imageUrls.length > 0) {
            return [...new Set(product.imageUrls)]; // Evita duplicados
        }
        return ['https://via.placeholder.com/400x500?text=Sin+Imagen']; 
    };

    const getSelectedIndex = (productId) => selectedImages[productId] ?? 0;

    const handleSelectImage = (productId, imageIndex) => {
        setSelectedImages((current) => ({ ...current, [productId]: imageIndex }));
    };

    const getDisplayImage = (product) => {
        const gallery = getGallery(product);
        const selectedIndex = getSelectedIndex(product.id);
        return gallery[selectedIndex] ?? gallery[0];
    };

    if (loading) {
        return (
            <main className="productos-wrapper d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center prod-loading">
                    <i className="fas fa-circle-notch fa-spin fa-2x mb-3 text-dark"></i>
                    <h3 className="fw-bold">Cargando catálogo...</h3>
                </motion.div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="productos-wrapper d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
                <div className="text-center text-danger prod-error">
                    <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <h3 className="fw-bold">{error}</h3>
                </div>
            </main>
        );
    }

    return (
        <main className="productos-wrapper">
            
            {/* HERO BANNER */}
            <section className="prod-hero-section">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.6 }}
                    className="prod-hero-content"
                >
                    <h1 className="prod-hero-title">Catálogo Performance</h1>
                    <p className="prod-hero-subtitle">Equipamiento premium diseñado para romper tus límites.</p>
                </motion.div>
            </section>

            <div className="container px-4 px-lg-5 pb-5">
                <div className="row g-5">
                    
                    {/* PANEL DE FILTROS LATERAL */}
                    <aside className="col-lg-3 d-none d-lg-block">
                        <div className="prod-filter-sidebar">
                            <h3 className="prod-filter-header">Filtros</h3>
                            
                            <div className="prod-filter-group">
                                <h4 className="prod-filter-title">Categorías</h4>
                                <ul className="prod-filter-list">
                                    <li><button className="active">Todos los productos</button></li>
                                    <li><button>New Arrivals</button></li>
                                    <li><button>Accesorios</button></li>
                                </ul>
                            </div>

                            <div className="prod-filter-group mt-4">
                                <h4 className="prod-filter-title">Talla</h4>
                                <div className="prod-size-grid">
                                    {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={size} type="button" className="prod-size-btn">
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
                            <span className="fw-semibold text-secondary" style={{fontSize: '14px'}}>Mostrando {productosReales.length} productos</span>
                            <select className="prod-sort-select">
                                <option>Más relevantes</option>
                                <option>Precio: Menor a Mayor</option>
                                <option>Precio: Mayor a Menor</option>
                            </select>
                        </div>

                        {productosReales.length === 0 && (
                            <div className="prod-empty-state">
                                <i className="fas fa-box-open fa-3x mb-3" style={{ color: '#d2d2d7' }}></i>
                                <p>No hay productos disponibles en este momento.</p>
                            </div>
                        )}

                        {/* GRILLA ANIMADA */}
                        <motion.div 
                            className="row g-4"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {productosReales.map((product) => (
                                <motion.div key={product.id} className="col-12 col-sm-6 col-md-4" variants={itemVariants}>
                                    <article className="prod-card">
                                        <div className="prod-image-wrap">
                                            
                                            {/* BADGES FLOTANTES */}
                                            <div className="prod-badge-container">
                                                {product.stock > 0 && product.stock <= 5 && (
                                                    <span className="prod-card-badge warning">¡ÚLTIMOS {product.stock}!</span>
                                                )}
                                                {product.stock === 0 && (
                                                    <span className="prod-card-badge error">AGOTADO</span>
                                                )}
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
                                                        className="prod-main-img"
                                                    />
                                                </AnimatePresence>
                                            </Link>
                                        </div>

                                        <div className="prod-card-info d-flex flex-column h-100">
                                            
                                            {/* MINIATURAS */}
                                            <div className="prod-thumbs">
                                                {getGallery(product).map((thumb, index) => (
                                                    <button
                                                        key={`${product.id}-${index}`}
                                                        type="button"
                                                        className={`prod-thumb-btn ${getSelectedIndex(product.id) === index ? 'is-active' : ''}`}
                                                        onMouseEnter={() => handleSelectImage(product.id, index)}
                                                        onClick={() => handleSelectImage(product.id, index)}
                                                        aria-label={`Mostrar miniatura ${index + 1}`}
                                                    >
                                                        <img src={thumb} alt="miniatura" />
                                                    </button>
                                                ))}
                                            </div>

                                            <h3 className="prod-product-title">{product.name}</h3>
                                            <p className="prod-product-desc">{product.description || "Descripción no disponible."}</p>
                                            <p className="prod-product-price">${Number(product.basePrice).toLocaleString('es-CL')}</p>
                                            
                                            <div style={{ flexGrow: 1 }}></div>

                                            {/* BOTÓN AÑADIR AL CARRITO */}
                                            <motion.button 
                                                whileTap={product.stock > 0 ? { scale: 0.95 } : {}}
                                                className={`prod-btn-primary mt-3 ${product.stock === 0 ? 'disabled' : ''}`}
                                                onClick={() => {
                                                    addToCart(product, 1);
                                                    mostrarToast(`¡${product.name} añadido!`, 'success');
                                                }}
                                                disabled={product.stock === 0}
                                            >
                                                {product.stock === 0 ? (
                                                    <><i className="fas fa-times-circle me-2"></i> SIN STOCK</>
                                                ) : (
                                                    <><i className="fas fa-shopping-bag me-2"></i> AÑADIR AL CARRITO</>
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

            {/* TOAST NOTIFICATION CLEAN STYLE */}
            <div className="prod-toast-container">
                <AnimatePresence>
                    {toast.mostrar && (
                        <motion.div 
                            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
                            animate={{ opacity: 1, y: 0, scale: 1 }} 
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className={`prod-toast ${toast.tipo === 'error' ? 'error' : 'success'}`}
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