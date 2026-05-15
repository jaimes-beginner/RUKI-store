import { useState, useEffect } from 'react';
import { useCart } from '../../../contexts/CartContext'; 
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { obtenerOfertas, obtenerCategoriasActivas } from '../../../services/ProductoService';
import './Sales.css';

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
        sort: 'discountDesc' 
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImages, setSelectedImages] = useState({});
    const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });

    const mostrarToast = (mensaje, tipo) => {
        setToast({ mostrar: true, mensaje, tipo });
        setTimeout(() => setToast(prev => ({ ...prev, mostrar: false })), 3000);
    };

    /*
        Cargar categorías y ofertas
    */
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [catsData, ofertasData] = await Promise.all([
                    obtenerCategoriasActivas(),
                    obtenerOfertas()
                ]);
                setCategorias(catsData);
                setAllProducts(ofertasData);
                setProducts(ofertasData);
            } catch (err) {
                setError(err.message || "Error al cargar los datos");
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    /*
        Lógica de filtrado local
    */
    useEffect(() => {
        let filtrados = [...allProducts];

        if (filtros.categoryId !== '') {
            filtrados = filtrados.filter(p => p.category?.id === filtros.categoryId || p.categoryId === filtros.categoryId);
        }

        if (filtros.size !== '') {
            filtrados = filtrados.filter(p => {
                if (p.variants && p.variants.length > 0) {
                    return p.variants.some(v => v.size === filtros.size && v.stock > 0);
                }
                return true;
            });
        }

        if (filtros.sort === 'priceAsc') {
            filtrados.sort((a, b) => a.salePrice - b.salePrice);
        } else if (filtros.sort === 'priceDesc') {
            filtrados.sort((a, b) => b.salePrice - a.salePrice);
        } else if (filtros.sort === 'discountDesc') {
            filtrados.sort((a, b) => calcularDescuento(b.basePrice, b.salePrice) - calcularDescuento(a.basePrice, a.salePrice));
        }

        setProducts(filtrados);
    }, [filtros, allProducts]);

    const handleFilterChange = (key, value) => {
        setFiltros(prev => ({
            ...prev,
            [key]: prev[key] === value ? '' : value
        }));
    };

    const getGallery = (product) => {
        if (!product.imageUrls || product.imageUrls.length === 0) {
            return ['/imagenes/placeholder.jpg'];
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

    const calcularDescuento = (oldPrice, newPrice) => {
        if (!oldPrice || !newPrice) return 0;
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
                    
                    {/* PANEL DE FILTROS LATERAL (GLASSMORPHISM) */}
                    <aside className="col-lg-3 d-none d-lg-block">
                        <div className="sale-filter-sidebar p-4 rounded-4 position-sticky" style={{ top: '180px' }}>
                            <h3 className="fw-bolder mb-4 text-dark" style={{ letterSpacing: '-0.02em' }}>Filtros</h3>
                            
                            {/* TALLAS */}
                            <div className="sale-filter-group mb-4">
                                <h4 className="text-muted small fw-bold mb-3" style={{ letterSpacing: '1px', fontSize: '0.75rem' }}>TALLA</h4>
                                <div className="sale-size-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {['XS', 'S', 'M', 'L', 'XL', 'Única'].map(size => (
                                        <motion.button 
                                            whileHover={{ scale: 1.05 }} 
                                            whileTap={{ scale: 0.95 }} 
                                            key={size} 
                                            type="button" 
                                            className={`py-2 rounded-3 fw-semibold transition-all ${filtros.size === size ? 'bg-danger text-white shadow-sm' : 'bg-transparent text-dark'}`}
                                            onClick={() => handleFilterChange('size', size)}
                                            style={{
                                                border: filtros.size === size ? '1.5px solid #ff3b30' : '1.5px solid #d2d2d7',
                                                backgroundColor: filtros.size === size ? '#ff3b30' : 'transparent',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {size}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* CATEGORÍAS */}
                            <div className="sale-filter-group">
                                <h4 className="text-muted small fw-bold mb-3" style={{ letterSpacing: '1px', fontSize: '0.75rem' }}>CATEGORÍAS</h4>
                                <ul className="list-unstyled p-0 m-0 d-flex flex-column gap-2 sale-scrollable-list">
                                    {[{ id: '', name: 'Todo en Oferta' }, ...categorias].map(cat => (
                                        <li key={cat.id || 'todos'}>
                                            <button
                                                className={`w-100 text-start px-3 py-2 rounded-3 border-0 transition-all ${filtros.categoryId === cat.id ? 'text-white fw-medium shadow-sm' : 'bg-transparent text-secondary'}`}
                                                onClick={() => handleFilterChange('categoryId', cat.id)}
                                                style={{ 
                                                    transition: 'all 0.2s ease',
                                                    backgroundColor: filtros.categoryId === cat.id ? '#ff3b30' : 'transparent'
                                                }}
                                                onMouseOver={(e) => { if (filtros.categoryId !== cat.id) e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.08)' }}
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

                    {/* ÁREA DE PRODUCTOS */}
                    <div className="col-lg-9">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                            <span className="fw-semibold text-secondary" style={{fontSize: '14px'}}>
                                Mostrando {products.length} ofertas
                            </span>
                            <select 
                                className="sale-sort-select"
                                value={filtros.sort}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                            >
                                <option value="discountDesc">Mayor Descuento</option>
                                <option value="priceAsc">Precio: Menor a Mayor</option>
                                <option value="priceDesc">Precio: Mayor a Menor</option>
                            </select>
                        </div>

                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                                    <i className="fas fa-circle-notch fa-spin fa-2x mb-3 text-danger"></i>
                                    <p className="text-muted fw-bold">Cargando ofertas...</p>
                                </motion.div>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger text-center py-4">
                                <i className="fas fa-exclamation-triangle me-2"></i> {error}
                            </div>
                        ) : products.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sale-empty-state text-center py-5">
                                <i className="fas fa-tags fa-3x mb-3 text-secondary"></i>
                                <h4>No hay ofertas activas</h4>
                                <p className="text-muted">Prueba cambiando los filtros de búsqueda.</p>
                                <button className="btn btn-outline-danger mt-2" onClick={() => setFiltros({ categoryId: '', size: '', sort: 'discountDesc' })}>
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
                                        <article className="sale-card d-flex flex-column">
                                            <div className="sale-image-wrap">
                                                
                                                {/* ETIQUETAS UNIFICADAS */}
                                                <div className="sale-badge-container d-flex flex-column align-items-start gap-2">
                                                    <span className="sale-card-badge shadow-sm" style={{ backgroundColor: '#ff3b30', color: '#ffffff', borderColor: '#ff3b30' }}>
                                                        OFERTA -{calcularDescuento(product.basePrice, product.salePrice)}%
                                                    </span>
                                                    {product.stock > 0 && product.stock <= 5 && (
                                                        <span className="sale-card-badge warning shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#ff9500' }}>
                                                            ¡ÚLTIMOS {product.stock}!
                                                        </span>
                                                    )}
                                                    {product.stock === 0 && (
                                                        <span className="sale-card-badge error shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#ff3b30' }}>
                                                            AGOTADO
                                                        </span>
                                                    )}
                                                </div>

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

                                            <div className="sale-card-info d-flex flex-column flex-grow-1">
                                                <div className="sale-thumbs">
                                                    {getGallery(product).length > 1 && getGallery(product).map((thumb, index) => (
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
                                                <p className="sale-product-desc text-muted mb-2" style={{ fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {product.description || "Oferta exclusiva RUKI."}
                                                </p>
                                                
                                                <div className="sale-price-wrap mb-3">
                                                    <span className="sale-price-new">${Number(product.salePrice).toLocaleString('es-CL')}</span>
                                                    <span className="sale-price-old">${Number(product.basePrice).toLocaleString('es-CL')}</span>
                                                </div>
                                                
                                                <div style={{ flexGrow: 1 }}></div>

                                                <motion.button 
                                                    whileTap={product.stock > 0 ? { scale: 0.95 } : {}}
                                                    className={`sale-btn-primary mt-auto w-100 ${product.stock === 0 ? 'disabled' : ''}`}
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
                        )}
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