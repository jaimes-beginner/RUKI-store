import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext'; 
import { filtrarProductos, obtenerCategoriasActivas } from '@/services/ProductoService'; 
import './NewArrivalsPage.css'; 

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
// Actualizamos el itemVariants para que tenga el efecto "spring" (rebote suave) igual que los otros
const itemVariants = { hidden: { opacity: 0, scale: 0.9, y: 20 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

export default function NewArrivalsPage() {
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filtros, setFiltros] = useState({ categoryId: '', size: '', sort: 'newest' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImages, setSelectedImages] = useState({});
    const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });
    
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const mostrarToast = (mensaje, tipo) => {
        setToast({ mostrar: true, mensaje, tipo });
        setTimeout(() => setToast({ ...toast, mostrar: false }), 3000);
    };

    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            try {
                const [catsData, newArrivalsData] = await Promise.all([
                    obtenerCategoriasActivas(),
                    filtrarProductos(filtros, currentPage, 6)
                ]);
                setCategorias(catsData);
                setProducts(newArrivalsData.content);
                setTotalPages(newArrivalsData.totalPages);
                setError(null);
            } catch (err) {
                setError(err.message || "Error al cargar los datos");
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [filtros, currentPage]);

    const handleFilterChange = (key, value) => {
        setFiltros(prev => ({ ...prev, [key]: prev[key] === value ? '' : value }));
        setCurrentPage(0);
    };

    const getGallery = (product) => (!product.imageUrls || product.imageUrls.length === 0) ? ['https://via.placeholder.com/400x500?text=Sin+Imagen'] : [...new Set(product.imageUrls)];
    const getSelectedIndex = (productId) => selectedImages[productId] ?? 0;
    const handleSelectImage = (productId, imageIndex) => setSelectedImages((current) => ({ ...current, [productId]: imageIndex }));
    const getDisplayImage = (product) => getGallery(product)[getSelectedIndex(product.id)] ?? getGallery(product)[0];

    return (
        <main className="new-arrivals-wrapper">
            <div className="na-glow-container">
                <div className="na-glow-blob na-blob-platinum"></div>
                <div className="na-glow-blob na-blob-silver"></div>
            </div>

            <section className="na-hero-section">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="na-hero-content">
                    <span className="na-hero-badge">COLECCIÓN 2026</span>
                    <h1 className="na-hero-title">New Arrivals</h1>
                    <p className="na-hero-subtitle">Descubre la última tecnología en ropa deportiva. Diseñada para romper tus límites.</p>
                </motion.div>
            </section>

            <div className="container px-3 px-lg-5 pb-5">
                
                <div className="d-block d-lg-none mb-4">
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-outline-light border-dark w-100 d-flex justify-content-between align-items-center"
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                    >
                        <span className="fw-bold"><i className="fas fa-filter me-2"></i> Filtros</span>
                        <motion.i animate={{ rotate: showMobileFilters ? 180 : 0 }} transition={{ duration: 0.3 }} className="fas fa-chevron-down"></motion.i>
                    </motion.button>
                </div>

                <div className="row g-4 g-lg-5">
                    <aside className={`col-lg-3 ${showMobileFilters ? 'd-block' : 'd-none d-lg-block'}`}>
                        <motion.div layout className="na-filter-sidebar position-sticky p-4" style={{ top: '100px' }}>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="fw-bolder text-white m-0" style={{ letterSpacing: '-0.02em' }}>Filtros</h3>
                                <button className="btn-close btn-close-white d-lg-none" onClick={() => setShowMobileFilters(false)}></button>
                            </div>
                            
                            <div className="na-filter-group mb-4">
                                <h4 className="small fw-bold mb-3" style={{ letterSpacing: '1px', fontSize: '0.75rem', color: '#a1a1a6' }}>TALLA</h4>
                                <div className="na-size-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {['XS', 'S', 'M', 'L', 'XL', 'Única'].map(size => (
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={size} type="button" className={`na-size-btn ${filtros.size === size ? 'active' : ''}`} onClick={() => handleFilterChange('size', size)}>{size}</motion.button>
                                    ))}
                                </div>
                            </div>
                            <div className="na-filter-group">
                                <h4 className="small fw-bold mb-3" style={{ letterSpacing: '1px', fontSize: '0.75rem', color: '#a1a1a6' }}>CATEGORÍAS</h4>
                                <ul className="list-unstyled p-0 m-0 d-flex flex-column gap-2 na-scrollable-list">
                                    {[{ id: '', name: 'Todos' }, ...categorias].map(cat => (
                                        <li key={cat.id || 'todos'}>
                                            <button className={`na-cat-btn ${filtros.categoryId === cat.id ? 'active' : ''}`} onClick={() => handleFilterChange('categoryId', cat.id)}>{cat.name}</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    </aside>

                    <div className="col-lg-9">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                            <span className="fw-semibold" style={{ fontSize: '14px', color: '#a1a1a6' }}>Mostrando {products.length} productos</span>
                            <div className="prod-sort-wrapper">
                                <select className="prod-sort-select" value={filtros.sort} onChange={(e) => handleFilterChange('sort', e.target.value)}>
                                    <option value="newest">Más recientes</option>
                                    <option value="priceAsc">Precio: Menor a Mayor</option>
                                    <option value="priceDesc">Precio: Mayor a Menor</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                                    <i className="fas fa-circle-notch fa-spin fa-2x mb-3 text-white"></i>
                                    <p className="fw-bold" style={{ color: '#a1a1a6' }}>Actualizando lanzamientos...</p>
                                </motion.div>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger text-center py-4 bg-transparent border-danger text-danger"><i className="fas fa-exclamation-triangle me-2"></i> {error}</div>
                        ) : products.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="na-empty-state text-center py-5">
                                <i className="fas fa-box-open fa-3x mb-3" style={{ color: '#444' }}></i>
                                <h4 className="text-white">No hay resultados</h4>
                                <p>No encontramos lanzamientos que coincidan con tus filtros.</p>
                                <button className="btn btn-outline-light mt-2" onClick={() => setFiltros({ categoryId: '', size: '', sort: 'newest' })}>Limpiar Filtros</button>
                            </motion.div>
                        ) : (
                            /* AÑADIMOS LAYOUT Y ANIMATEPRESENCE AQUÍ */
                            <motion.div layout className="row g-3 g-md-4" variants={containerVariants} initial="hidden" animate="visible">
                                <AnimatePresence>
                                    {products.map((product) => (
                                        <motion.div layout key={product.id} className="col-6 col-md-4" variants={itemVariants} exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}>
                                            <article className="na-card d-flex flex-column">
                                                <div className="na-image-wrap">
                                                    <div className="na-badge-container d-flex flex-column align-items-start gap-1 gap-md-2">
                                                        <span className="na-card-badge shadow-sm" style={{ backgroundColor: '#ffffff', color: '#000000', borderColor: '#ffffff' }}>NEW</span>
                                                        {product.sale && product.basePrice > 0 && <span className="na-card-badge shadow-sm" style={{ backgroundColor: '#ff3b30', color: '#ffffff', borderColor: '#ff3b30' }}>-{Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)}%</span>}
                                                        {product.stock > 0 && product.stock <= 5 && <span className="na-card-badge warning shadow-sm" style={{ backgroundColor: '#ff9500', color: '#ffffff', borderColor: '#ff9500' }}>¡ÚLTIMOS {product.stock}!</span>}
                                                        {product.stock === 0 && <span className="na-card-badge error shadow-sm" style={{ backgroundColor: '#ff3b30', color: '#ffffff', borderColor: '#ff3b30' }}>AGOTADO</span>}
                                                    </div>
                                                    <Link to={`/producto/${product.id}`}>
                                                        <AnimatePresence mode="wait">
                                                            <motion.img key={getDisplayImage(product)} src={getDisplayImage(product)} alt={product.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="na-main-img" />
                                                        </AnimatePresence>
                                                    </Link>
                                                </div>
                                                <div className="na-card-info d-flex flex-column flex-grow-1">
                                                    <div className="na-thumbs">
                                                        {getGallery(product).length > 1 && getGallery(product).map((thumb, index) => (
                                                            <button key={`${product.id}-${index}`} type="button" className={`na-thumb-btn ${getSelectedIndex(product.id) === index ? 'is-active' : ''}`} onMouseEnter={() => handleSelectImage(product.id, index)} onClick={() => handleSelectImage(product.id, index)}><img src={thumb} alt={`Miniatura ${index + 1}`} /></button>
                                                        ))}
                                                    </div>
                                                    <h3 className="na-product-title text-truncate">{product.name}</h3>
                                                    <p className="na-product-desc mb-2 d-none d-md-block">{product.description || "Nueva colección RUKI."}</p>
                                                    <div className="mb-2 mb-md-3 mt-auto">
                                                        {product.sale ? (
                                                            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-1 gap-md-2">
                                                                <span className="text-danger fw-bold fs-6 fs-md-5">${Number(product.salePrice).toLocaleString('es-CL')}</span>
                                                                <span className="text-decoration-line-through small" style={{ color: '#666' }}>${Number(product.basePrice).toLocaleString('es-CL')}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="fw-bold fs-6 fs-md-5 text-white">${Number(product.basePrice).toLocaleString('es-CL')}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </article>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
                            <button className="btn border-dark" disabled={currentPage === 0} onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0, 0); }}><i className="fas fa-chevron-left"></i></button>
                            <span className="text-white fw-bold small">Página {currentPage + 1} de {totalPages}</span>
                            <button className="btn border-dark" disabled={currentPage >= totalPages - 1} onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0, 0); }}><i className="fas fa-chevron-right"></i></button>
                        </div>
                    )}
                </div>
            </div>

            <div className="na-toast-container">
                <AnimatePresence>
                    {toast.mostrar && (
                        <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className={`na-toast ${toast.tipo === 'error' ? 'error' : 'success'}`}>
                            <i className={`fas ${toast.tipo === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'} me-2 fs-5`}></i>{toast.mensaje}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}