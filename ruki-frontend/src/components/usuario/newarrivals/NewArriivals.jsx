import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { obtenerNewArrivals } from '../../../services/ProductoService';
import './NewArriivals.css'; 

/*
    Variantes para la animación 
    en cascada del Grid
*/
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function NewArrivals() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImages, setSelectedImages] = useState({});

    useEffect(() => {
        const cargarNuevosLanzamientos = async () => {
            try {
                const data = await obtenerNewArrivals();
                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        cargarNuevosLanzamientos();
    }, []);

    // Adaptamos la galería para que lea el arreglo imageUrls del backend
    const getGallery = (product) => {
        if (!product.imageUrls || product.imageUrls.length === 0) {
            return ['/imagenes/placeholder.jpg']; // Fallback si el admin no subió fotos
        }
        // Usamos Set por si hubieran URLs duplicadas accidentalmente
        return [...new Set(product.imageUrls)]; 
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

    return (
        <main className="new-arrivals-wrapper">

            {/* HERO BANNER */}
            <section className="na-hero-section">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.6 }}
                    className="na-hero-content"
                >
                    <span className="na-hero-badge">COLECCIÓN 2026</span>
                    <h1 className="na-hero-title">New Arrivals</h1>
                    <p className="na-hero-subtitle">Descubre la última tecnología en ropa deportiva. Diseñada para romper tus límites.</p>
                </motion.div>
            </section>

            <div className="container px-4 px-lg-5 pb-5">
                <div className="row g-5">
                    
                    {/* BARRA LATERAL CON LOS FILTROS */}
                    {/* Nota de Arquitectura: Por ahora los dejamos visuales, luego los podemos conectar al endpoint /filter si el cliente quiere buscar aquí */}
                    <aside className="col-lg-3 d-none d-lg-block">
                        <div className="na-filter-sidebar">
                            <h3 className="na-filter-header">Filtros</h3>
                            
                            <div className="na-filter-group">
                                <h4 className="na-filter-title">Talla</h4>
                                <div className="na-size-grid">
                                    {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={size} type="button" className="na-size-btn">
                                            {size}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            <div className="na-filter-group mt-4">
                                <h4 className="na-filter-title">Categoría</h4>
                                <ul className="na-filter-list">
                                    <li><button className="active">Todo</button></li>
                                    <li><button>Poleras</button></li>
                                    <li><button>Shorts</button></li>
                                    <li><button>Accesorios</button></li>
                                </ul>
                            </div>
                        </div>
                    </aside>

                    {/* GRILLA DE PRODUCTOS */}
                    <div className="col-lg-9">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="fw-semibold text-secondary" style={{fontSize: '14px'}}>
                                Mostrando {products.length} productos
                            </span>
                            <select className="na-sort-select">
                                <option>Más recientes</option>
                                <option>Precio: Menor a Mayor</option>
                                <option>Precio: Mayor a Menor</option>
                            </select>
                        </div>

                        {/* ESTADOS DE CARGA Y ERROR */}
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger text-center py-4">
                                <i className="fas fa-exclamation-triangle me-2"></i> {error}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <i className="fas fa-box-open fa-3x mb-3"></i>
                                <h4>Aún no hay nuevos lanzamientos</h4>
                            </div>
                        ) : (
                            <motion.div 
                                className="row g-4"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {products.map((product) => (
                                    <motion.div key={product.id} className="col-12 col-sm-6 col-md-4" variants={itemVariants}>
                                        <article className="na-card">
                                            <div className="na-image-wrap">
                                                
                                                {/* ETIQUETAS DINÁMICAS (NUEVO Y OFERTA) */}
                                                <div className="d-flex flex-column gap-1 position-absolute" style={{ top: '10px', left: '10px', zIndex: 2 }}>
                                                    <div className="na-card-badge position-relative top-0 start-0">NEW</div>
                                                    {product.sale && (
                                                        <div className="na-card-badge bg-danger position-relative top-0 start-0 mt-1" style={{background: '#ff3b30', borderColor: '#ff3b30'}}>SALE</div>
                                                    )}
                                                </div>
                                                
                                                {/* TRANSICIÓN SUAVE DE IMÁGENES */}
                                                <AnimatePresence mode="wait">
                                                    <motion.img 
                                                        key={getDisplayImage(product)} 
                                                        src={getDisplayImage(product)} 
                                                        alt={product.name}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="na-main-img"
                                                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                                    />
                                                </AnimatePresence>
                                            </div>

                                            <div className="na-card-info">
                                                <div className="na-thumbs">
                                                    {/* Renderizamos miniaturas solo si hay más de 1 imagen */}
                                                    {getGallery(product).length > 1 && getGallery(product).map((thumb, index) => (
                                                        <button
                                                            key={`${product.id}-${index}`}
                                                            type="button"
                                                            className={`na-thumb-btn ${getSelectedIndex(product.id) === index ? 'is-active' : ''}`}
                                                            onMouseEnter={() => handleSelectImage(product.id, index)}
                                                            onClick={() => handleSelectImage(product.id, index)}
                                                            aria-label={`Mostrar imagen ${index + 1}`}
                                                        >
                                                            <img src={thumb} alt={`Miniatura ${index + 1}`} style={{ objectFit: 'cover' }} />
                                                        </button>
                                                    ))}
                                                </div>
                                                
                                                <h3 className="na-product-title">{product.name}</h3>
                                                
                                                {/* LÓGICA DE PRECIOS */}
                                                {product.sale ? (
                                                    <p className="na-product-price">
                                                        <span className="text-danger fw-bold me-2">${Number(product.salePrice).toLocaleString('es-CL')}</span>
                                                        <span className="text-muted text-decoration-line-through" style={{fontSize: '0.85em'}}>${Number(product.basePrice).toLocaleString('es-CL')}</span>
                                                    </p>
                                                ) : (
                                                    <p className="na-product-price">${Number(product.basePrice).toLocaleString('es-CL')}</p>
                                                )}
                                            </div>
                                        </article>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
}