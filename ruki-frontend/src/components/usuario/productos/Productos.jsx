import { useState, useEffect } from 'react';
import { useCart } from '../../../contexts/CartContext'; 
import { obtenerProductosActivos } from '../../../services/ProductoService'; 
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Productos.css';

// Animaciones base para Framer Motion
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
};

const slideInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
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
            return product.imageUrls;
        }
        return ['https://via.placeholder.com/300x400?text=Sin+Imagen']; 
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
            <main className="ios-products-page d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center ios-loading">
                    <i className="fas fa-circle-notch fa-spin fa-3x mb-3" style={{ color: '#0a84ff' }}></i>
                    <h3>Cargando catálogo...</h3>
                </motion.div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="ios-products-page d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
                <div className="text-center text-danger ios-error">
                    <i className="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <h3>{error}</h3>
                </div>
            </main>
        );
    }

    return (
        <main className="ios-products-page position-relative">
            {/* LUCES AMBIENTALES DE FONDO (Matan el vacío) */}
            <div className="ios-ambient-blob catalog-blob-1"></div>
            <div className="ios-ambient-blob catalog-blob-2"></div>

            <section className="py-4 container position-relative" style={{ zIndex: 1 }}>
                <div className="row g-4">
                    
                    {/* PANEL DE FILTROS LATERAL (Ahora es de cristal) */}
                    <motion.aside 
                        className="col-12 col-md-3"
                        variants={slideInLeft}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="ios-filter-panel-glass">
                            <p className="ios-filter-title"><i className="fas fa-sliders-h me-2"></i> Filtros</p>
                            
                            <div className="ios-filter-block">
                                <p className="ios-filter-subtitle">Categorías</p>
                                <div className="d-flex flex-column gap-2 mb-4">
                                    <button className="ios-btn-ghost active">Todos los productos</button>
                                    <button className="ios-btn-ghost">New Arrivals</button>
                                    <button className="ios-btn-ghost">Accesorios</button>
                                </div>

                                <p className="ios-filter-subtitle">Talla</p>
                                <div className="d-flex flex-wrap gap-2">
                                    {['XS', 'S', 'M', 'L', 'XL'].map(talla => (
                                        <button key={talla} type="button" className="ios-btn ios-btn-outline py-1 px-3">
                                            {talla}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.aside>

                    {/* ÁREA DE PRODUCTOS */}
                    <div className="col-12 col-md-9">
                        <motion.div 
                            className="ios-page-header-glass"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2>Catálogo Performance</h2>
                            <p>Equipamiento premium a solo un click.</p>
                        </motion.div>

                        {productosReales.length === 0 && (
                            <div className="ios-empty-state">
                                <i className="fas fa-box-open fa-3x mb-3" style={{ color: '#d2d2d7' }}></i>
                                <p>No hay productos disponibles en este momento.</p>
                            </div>
                        )}

                        {/* GRILLA ANIMADA */}
                        <motion.div 
                            className="ios-product-grid"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            {productosReales.map((product) => (
                                <motion.article key={product.id} className="ios-card-glass" variants={fadeInUp} whileHover={{ y: -6 }}>
                                    <div className="ios-card-img-wrap">
                                        <Link to={`/producto/${product.id}`}>
                                            <img src={getDisplayImage(product)} alt={product.name} />
                                        </Link>

                                        {/* BADGES FLOTANTES */}
                                        <div className="ios-badge-container">
                                            {product.stock > 0 && product.stock <= 5 && (
                                                <span className="ios-badge ios-badge-sale">¡ÚLTIMOS {product.stock}!</span>
                                            )}
                                            {product.stock === 0 && (
                                                <span className="ios-badge ios-badge-soldout">AGOTADO</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ios-card-content">
                                        <h3 className="ios-card-title">{product.name}</h3>
                                        <p className="ios-card-desc">
                                            {product.description || "Descripción no disponible."}
                                        </p>
                                        <p className="ios-card-price">
                                            ${Number(product.basePrice).toLocaleString('es-CL')}
                                        </p>

                                        {/* MINIATURAS */}
                                        <div className="ios-card-thumbs">
                                            {getGallery(product).map((thumb, index) => (
                                                <button
                                                    key={`${product.id}-${index}`}
                                                    type="button"
                                                    className={`ios-thumb-btn ${getSelectedIndex(product.id) === index ? 'is-active' : ''}`}
                                                    onClick={() => handleSelectImage(product.id, index)}
                                                    aria-label={`Mostrar miniatura ${index + 1}`}
                                                >
                                                    <img src={thumb} alt="miniatura" />
                                                </button>
                                            ))}
                                        </div>

                                        <div style={{ flexGrow: 1 }}></div>

                                        <motion.button 
                                            whileTap={product.stock > 0 ? { scale: 0.95 } : {}}
                                            className={`ios-btn w-100 mt-2 ${product.stock > 0 ? 'ios-btn-dark' : 'ios-btn-disabled'}`}
                                            onClick={() => {
                                                addToCart(product, 1);
                                                mostrarToast(`¡${product.name} añadido!`, 'success');
                                            }}
                                            disabled={product.stock === 0}
                                        >
                                            {product.stock === 0 ? (
                                                <><i className="fas fa-times-circle me-2"></i> SIN STOCK</>
                                            ) : (
                                                <><i className="fas fa-shopping-bag me-2"></i> AÑADIR</>
                                            )}
                                        </motion.button>
                                    </div>
                                </motion.article>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* TOAST NOTIFICATION PREMIUM */}
            <div className="toast-container position-fixed bottom-0 end-0 p-4" style={{ zIndex: 1050 }}>
                <div className={`ios-toast ${toast.mostrar ? 'show' : ''}`} role="alert">
                    <div className="ios-toast-body">
                        {toast.tipo === 'success' ? (
                            <div className="ios-toast-icon success"><i className="fas fa-check"></i></div>
                        ) : (
                            <div className="ios-toast-icon error"><i className="fas fa-exclamation-triangle"></i></div>
                        )}
                        <span>{toast.mensaje}</span>
                    </div>
                </div>
            </div>
        </main>
    );
}