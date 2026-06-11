import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { filtrarProductos, obtenerCategoriasActivas } from '@/services/ProductoService'; 
import './SalePage.css'; 

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

export default function SalePage() {
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filtros, setFiltros] = useState({ categoryId: '', size: '', sort: 'discountDesc' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImages, setSelectedImages] = useState({});
    const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });

    const mostrarToast = (mensaje, tipo) => {
        setToast({ mostrar: true, mensaje, tipo });
        setTimeout(() => setToast(prev => ({ ...prev, mostrar: false })), 3000);
    };

    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            try {
                const filtrosParaOfertas = { ...filtros, isSale: true };
                const [catsData, ofertasData] = await Promise.all([
                    obtenerCategoriasActivas(),
                    filtrarProductos(filtrosParaOfertas, currentPage, 6)
                ]);
                setCategorias(catsData);
                setProducts(ofertasData.content);
                setTotalPages(ofertasData.totalPages);
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

    const getGallery = (product) => (!product.imageUrls || product.imageUrls.length === 0) ? ['/imagenes/placeholder.jpg'] : [...new Set(product.imageUrls)];
    const getSelectedIndex = (productId) => selectedImages[productId] ?? 0;
    const handleSelectImage = (productId, imageIndex) => setSelectedImages((current) => ({ ...current, [productId]: imageIndex }));
    const getDisplayImage = (product) => getGallery(product)[getSelectedIndex(product.id)] ?? getGallery(product)[0];
    const calcularDescuento = (oldPrice, newPrice) => (!oldPrice || !newPrice) ? 0 : Math.round(((oldPrice - newPrice) / oldPrice) * 100);

    return (
        <main className="sale-wrapper">
            <div className="sale-glow-container">
                <div className="sale-glow-blob sale-blob-red"></div>
                <div className="sale-glow-blob sale-blob-crimson"></div>
            </div>

            <section className="sale-hero-section">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="sale-hero-content">
                    <span className="sale-hero-badge">TIEMPO LIMITADO</span>
                    <h1 className="sale-hero-title">Sale</h1>
                    <p className="sale-hero-subtitle">Rendimiento máximo. Precios mínimos. Renueva tu equipamiento hoy mismo.</p>
                </motion.div>
            </section>

            <div className="container px-4 px-lg-5 pb-5">
                <div className="row g-5">
                    <aside className="col-lg-3 d-none d-lg-block">
                        <div className="sale-filter-sidebar p-4 position-sticky" style={{ top: '180px' }}>
                            <h3 className="fw-bolder mb-4 text-white" style={{ letterSpacing: '-0.02em' }}>Filtros</h3>
                            <div className="sale-filter-group mb-4">
                                <h4 className="small fw-bold mb-3" style={{ letterSpacing: '1px', fontSize: '0.75rem', color: '#a1a1a6' }}>TALLA</h4>
                                <div className="sale-size-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {['XS', 'S', 'M', 'L', 'XL', 'Única'].map(size => (
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={size} type="button" className={`sale-size-btn ${filtros.size === size ? 'active' : ''}`} onClick={() => handleFilterChange('size', size)}>{size}</motion.button>
                                    ))}
                                </div>
                            </div>
                            <div className="sale-filter-group">
                                <h4 className="small fw-bold mb-3" style={{ letterSpacing: '1px', fontSize: '0.75rem', color: '#a1a1a6' }}>CATEGORÍAS</h4>
                                <ul className="list-unstyled p-0 m-0 d-flex flex-column gap-2 sale-scrollable-list">
                                    {[{ id: '', name: 'Todo en Oferta' }, ...categorias].map(cat => (
                                        <li key={cat.id || 'todos'}>
                                            <button className={`sale-cat-btn ${filtros.categoryId === cat.id ? 'active' : ''}`} onClick={() => handleFilterChange('categoryId', cat.id)}>{cat.name}</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </aside>

                    <div className="col-lg-9">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                            <span className="fw-semibold" style={{ fontSize: '14px', color: '#a1a1a6' }}>Mostrando {products.length} ofertas</span>
                            <div className="prod-sort-wrapper">
                                <select className="prod-sort-select" value={filtros.sort} onChange={(e) => handleFilterChange('sort', e.target.value)}>
                                    <option value="newest">Mayor Descuento</option>
                                    <option value="priceAsc">Precio: Menor a Mayor</option>
                                    <option value="priceDesc">Precio: Mayor a Menor</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                                    <i className="fas fa-circle-notch fa-spin fa-2x mb-3 text-danger"></i>
                                    <p className="fw-bold" style={{ color: '#a1a1a6' }}>Cargando ofertas...</p>
                                </motion.div>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger text-center py-4 bg-transparent border-danger text-danger"><i className="fas fa-exclamation-triangle me-2"></i> {error}</div>
                        ) : products.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sale-empty-state text-center py-5">
                                <i className="fas fa-tags fa-3x mb-3" style={{ color: '#444' }}></i>
                                <h4 className="text-white">No hay ofertas activas</h4>
                                <p>Prueba cambiando los filtros de búsqueda.</p>
                                <button className="btn btn-outline-light mt-2" onClick={() => setFiltros({ categoryId: '', size: '', sort: 'discountDesc' })}>Limpiar Filtros</button>
                            </motion.div>
                        ) : (
                            <motion.div key={`${filtros.sort}-${filtros.categoryId}-${filtros.size}-${products.length}`} className="row g-4" variants={containerVariants} initial="hidden" animate="visible">
                                {products.map((product, index) => (
                                    <motion.div key={`${product.id}-${index}`} className="col-12 col-sm-6 col-md-4" variants={itemVariants}>
                                        <article className="sale-card d-flex flex-column">
                                            <div className="sale-image-wrap">
                                                <div className="sale-badge-container d-flex flex-column align-items-start gap-2">
                                                    <span className="sale-card-badge shadow-sm" style={{ backgroundColor: 'rgba(255, 59, 48, 0.9)', color: '#ffffff', borderColor: 'rgba(255,59,48,0.5)' }}>OFERTA -{calcularDescuento(product.basePrice, product.salePrice)}%</span>
                                                    {product.stock > 0 && product.stock <= 5 && <span className="sale-card-badge warning shadow-sm" style={{ backgroundColor: 'rgba(255, 149, 0, 0.9)', color: '#ffffff' }}>¡ÚLTIMOS {product.stock}!</span>}
                                                    {product.stock === 0 && <span className="sale-card-badge error shadow-sm" style={{ backgroundColor: 'rgba(255, 59, 48, 0.9)', color: '#ffffff' }}>AGOTADO</span>}
                                                </div>
                                                <Link to={`/producto/${product.id}`}>
                                                    <AnimatePresence mode="wait">
                                                        <motion.img key={`${product.id}-${getDisplayImage(product)}`} src={getDisplayImage(product)} alt={product.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="sale-main-img" />
                                                    </AnimatePresence>
                                                </Link>
                                            </div>
                                            <div className="sale-card-info d-flex flex-column flex-grow-1">
                                                <div className="sale-thumbs">
                                                    {getGallery(product).length > 1 && getGallery(product).map((thumb, idx) => (
                                                        <button key={`${product.id}-${idx}`} type="button" className={`sale-thumb-btn ${getSelectedIndex(product.id) === idx ? 'is-active' : ''}`} onMouseEnter={() => handleSelectImage(product.id, idx)} onClick={() => handleSelectImage(product.id, idx)}><img src={thumb} alt="miniatura" /></button>
                                                    ))}
                                                </div>
                                                <h3 className="sale-product-title">{product.name}</h3>
                                                <p className="sale-product-desc mb-2">{product.description || "Oferta exclusiva RUKI."}</p>
                                                <div className="sale-price-wrap mb-3">
                                                    <span className="sale-price-new">${Number(product.salePrice).toLocaleString('es-CL')}</span>
                                                    <span className="sale-price-old">${Number(product.basePrice).toLocaleString('es-CL')}</span>
                                                </div>
                                                <div style={{ flexGrow: 1 }}></div>
                                            </div>
                                        </article>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
                            <button className="btn btn-outline-light" disabled={currentPage === 0} onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0, 0); }}><i className="fas fa-chevron-left"></i> Anterior</button>
                            <span className="text-white fw-bold">Página {currentPage + 1} de {totalPages}</span>
                            <button className="btn btn-outline-light" disabled={currentPage >= totalPages - 1} onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0, 0); }}>Siguiente <i className="fas fa-chevron-right"></i></button>
                        </div>
                    )}
                </div>
            </div>

            <div className="sale-toast-container">
                <AnimatePresence>
                    {toast.mostrar && (
                        <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className={`sale-toast ${toast.tipo === 'error' ? 'error' : 'success'}`}>
                            <i className={`fas ${toast.tipo === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'} me-2 fs-5`}></i>{toast.mensaje}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}