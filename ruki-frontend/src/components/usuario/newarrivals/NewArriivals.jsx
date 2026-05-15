import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { obtenerNewArrivals, obtenerCategoriasActivas } from '../../../services/ProductoService';
import './NewArriivals.css'; 

/* 
    Variantes para la animación en cascada del Grid 
*/
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function NewArrivals() {
    const { addToCart } = useCart();
    
    /*
        Estados base
    */
    const [allProducts, setAllProducts] = useState([]); 
    const [products, setProducts] = useState([]);      
    const [categorias, setCategorias] = useState([]);
    
    /*
        Estado de filtros
    */
    const [filtros, setFiltros] = useState({
        categoryId: '',
        size: '',
        sort: 'newest'
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImages, setSelectedImages] = useState({});
    const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });

    const mostrarToast = (mensaje, tipo) => {
        setToast({ mostrar: true, mensaje, tipo });
        setTimeout(() => setToast({ ...toast, mostrar: false }), 3000);
    };

    /*
        Cargar datos iniciales (Categorías y New Arrivals)
    */
    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            try {
                const [catsData, newArrivalsData] = await Promise.all([
                    obtenerCategoriasActivas(),
                    obtenerNewArrivals()
                ]);
                setCategorias(catsData);
                setAllProducts(newArrivalsData);
                setProducts(newArrivalsData);
            } catch (err) {
                setError(err.message || "Error al cargar los datos");
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    /*
        Aplicar filtros locales cuando el usuario interactúa
    */
    useEffect(() => {
        let filtrados = [...allProducts];

        /*
            Filtro por Categoría
        */
        if (filtros.categoryId !== '') {
            filtrados = filtrados.filter(p => p.category?.id === filtros.categoryId || p.categoryId === filtros.categoryId);
        }

        /*
            Filtro por Talla (Buscando en variants)
        */
        if (filtros.size !== '') {
            filtrados = filtrados.filter(p => {
                if (p.variants && p.variants.length > 0) {
                    return p.variants.some(v => v.size === filtros.size && v.stock > 0);
                }

                /*
                    Si el producto no tiene variantes complejas, lo 
                    dejamos pasar por defecto
                */
                return true; 
            });
        }

        /*
            Ordenamiento
        */
        if (filtros.sort === 'priceAsc') {
            filtrados.sort((a, b) => (a.sale ? a.salePrice : a.basePrice) - (b.sale ? b.salePrice : b.basePrice));
        } else if (filtros.sort === 'priceDesc') {
            filtrados.sort((a, b) => (b.sale ? b.salePrice : b.basePrice) - (a.sale ? a.salePrice : a.basePrice));
        }

        setProducts(filtrados);
    }, [filtros, allProducts]);

    const handleFilterChange = (key, value) => {
        setFiltros(prev => ({
            ...prev,
            [key]: prev[key] === value ? '' : value // Toggle
        }));
    };

    /*
        Funciones de galería
    */
    const getGallery = (product) => {
        if (!product.imageUrls || product.imageUrls.length === 0) {
            return ['https://via.placeholder.com/400x500?text=Sin+Imagen'];
        }
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
                    
                    {/* PANEL DE FILTROS LATERAL (GLASSMORPHISM) */}
                    <aside className="col-lg-3 d-none d-lg-block">
                        <div className="na-filter-sidebar position-sticky p-4 rounded-4" style={{ top: '180px' }}>
                            <h3 className="fw-bolder mb-4 text-dark" style={{ letterSpacing: '-0.02em' }}>Filtros</h3>
                            
                            {/* TALLAS */}
                            <div className="na-filter-group mb-4">
                                <h4 className="text-muted small fw-bold mb-3" style={{ letterSpacing: '1px', fontSize: '0.75rem' }}>TALLA</h4>
                                <div className="na-size-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {['XS', 'S', 'M', 'L', 'XL', 'Única'].map(size => (
                                        <motion.button 
                                            whileHover={{ scale: 1.05 }} 
                                            whileTap={{ scale: 0.95 }} 
                                            key={size} 
                                            type="button" 
                                            className={`py-2 rounded-3 fw-semibold transition-all ${filtros.size === size ? 'bg-dark text-white shadow-sm' : 'bg-transparent text-dark'}`}
                                            onClick={() => handleFilterChange('size', size)}
                                            style={{
                                                border: filtros.size === size ? '1.5px solid #1d1d1f' : '1.5px solid #d2d2d7',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {size}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* CATEGORÍAS */}
                            <div className="na-filter-group">
                                <h4 className="text-muted small fw-bold mb-3" style={{ letterSpacing: '1px', fontSize: '0.75rem' }}>CATEGORÍAS</h4>
                                <ul className="list-unstyled p-0 m-0 d-flex flex-column gap-2 na-scrollable-list">
                                    {[{ id: '', name: 'Todos' }, ...categorias].map(cat => (
                                        <li key={cat.id || 'todos'}>
                                            <button
                                                className={`w-100 text-start px-3 py-2 rounded-3 border-0 transition-all ${filtros.categoryId === cat.id ? 'bg-dark text-white fw-medium shadow-sm' : 'bg-transparent text-secondary'}`}
                                                onClick={() => handleFilterChange('categoryId', cat.id)}
                                                style={{ transition: 'all 0.2s ease' }}
                                                onMouseOver={(e) => { if (filtros.categoryId !== cat.id) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)' }}
                                                onMouseOut={(e) => { if (filtros.categoryId !== cat.id) e.currentTarget.style.backgroundColor = 'transparent' }}
                                            >
                                                {cat.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </aside>

                    {/* GRILLA DE PRODUCTOS */}
                    <div className="col-lg-9">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                            <span className="fw-semibold text-secondary" style={{fontSize: '14px'}}>
                                Mostrando {products.length} productos
                            </span>
                            <select 
                                className="na-sort-select"
                                value={filtros.sort}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                            >
                                <option value="newest">Más recientes</option>
                                <option value="priceAsc">Precio: Menor a Mayor</option>
                                <option value="priceDesc">Precio: Mayor a Menor</option>
                            </select>
                        </div>

                        {/* ESTADOS DE CARGA Y ERROR */}
                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                                    <i className="fas fa-circle-notch fa-spin fa-2x mb-3 text-secondary"></i>
                                    <p className="text-muted fw-bold">Actualizando lanzamientos...</p>
                                </motion.div>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger text-center py-4">
                                <i className="fas fa-exclamation-triangle me-2"></i> {error}
                            </div>
                        ) : products.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="na-empty-state text-center py-5">
                                <i className="fas fa-box-open fa-3x mb-3" style={{ color: '#d2d2d7' }}></i>
                                <h4>No hay resultados</h4>
                                <p className="text-muted">No encontramos lanzamientos que coincidan con tus filtros.</p>
                                <button className="btn btn-outline-secondary mt-2" onClick={() => setFiltros({ categoryId: '', size: '', sort: 'newest' })}>
                                    Limpiar Filtros
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div 
                                className="row g-4"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {products.map((product) => (
                                    <motion.div key={product.id} className="col-12 col-sm-6 col-md-4" variants={itemVariants}>
                                        <article className="na-card d-flex flex-column">
                                            <div className="na-image-wrap">
                                                
                                                {/* ETIQUETAS DINÁMICAS APILADAS (NEW, OFERTA, STOCK) */}
                                                <div className="na-badge-container d-flex flex-column align-items-start gap-2">
                                                    <span className="na-card-badge shadow-sm bg-dark text-white border-dark">NEW</span>
                                                    
                                                    {product.sale && product.basePrice > 0 && (
                                                        <span className="na-card-badge shadow-sm text-white" style={{ backgroundColor: '#ff3b30', borderColor: '#ff3b30' }}>
                                                            OFERTA -{Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)}%
                                                        </span>
                                                    )}
                                                    {product.stock > 0 && product.stock <= 5 && (
                                                        <span className="na-card-badge warning shadow-sm">¡ÚLTIMOS {product.stock}!</span>
                                                    )}
                                                    {product.stock === 0 && (
                                                        <span className="na-card-badge error shadow-sm">AGOTADO</span>
                                                    )}
                                                </div>
                                                
                                                {/* TRANSICIÓN SUAVE DE IMÁGENES */}
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
                                                            className="na-main-img"
                                                        />
                                                    </AnimatePresence>
                                                </Link>
                                            </div>

                                            <div className="na-card-info d-flex flex-column flex-grow-1">
                                                <div className="na-thumbs">
                                                    {getGallery(product).length > 1 && getGallery(product).map((thumb, index) => (
                                                        <button
                                                            key={`${product.id}-${index}`}
                                                            type="button"
                                                            className={`na-thumb-btn ${getSelectedIndex(product.id) === index ? 'is-active' : ''}`}
                                                            onMouseEnter={() => handleSelectImage(product.id, index)}
                                                            onClick={() => handleSelectImage(product.id, index)}
                                                            aria-label={`Mostrar imagen ${index + 1}`}
                                                        >
                                                            <img src={thumb} alt={`Miniatura ${index + 1}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                                
                                                <h3 className="na-product-title">{product.name}</h3>
                                                <p className="na-product-desc text-muted mb-2" style={{ fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {product.description || "Nueva colección RUKI."}
                                                </p>
                                                
                                                {/* LÓGICA DE PRECIOS */}
                                                <div className="mb-3">
                                                    {product.sale ? (
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="text-danger fw-bold fs-5">${Number(product.salePrice).toLocaleString('es-CL')}</span>
                                                            <span className="text-muted text-decoration-line-through small">${Number(product.basePrice).toLocaleString('es-CL')}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="fw-bold fs-5 text-dark">${Number(product.basePrice).toLocaleString('es-CL')}</span>
                                                    )}
                                                </div>

                                                <div style={{ flexGrow: 1 }}></div>

                                                {/* BOTÓN AÑADIR AL CARRITO */}
                                                <motion.button
                                                    whileTap={product.stock > 0 ? { scale: 0.95 } : {}}
                                                    className={`na-btn-primary mt-auto w-100 ${product.stock === 0 ? 'disabled' : ''}`}
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
                        )}
                    </div>
                </div>
            </div>

            {/* TOAST NOTIFICATION */}
            <div className="na-toast-container">
                <AnimatePresence>
                    {toast.mostrar && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className={`na-toast ${toast.tipo === 'error' ? 'error' : 'success'}`}
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