import { useState, useEffect } from 'react';
import { useCart } from '../../../contexts/CartContext';
import { filtrarProductos, obtenerCategoriasActivas } from '../../../services/ProductoService';
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
    const [categorias, setCategorias] = useState([]);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

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
        Cargar las categorías una sola vez al montar el componente
    */
    useEffect(() => {
        obtenerCategoriasActivas()
            .then(data => setCategorias(data))
            .catch(err => console.error("Error al cargar categorías", err));
    }, []);

    // CARGAR EL CATÁLOGO CADA VEZ QUE CAMBIE ALGÚN FILTRO O LA PÁGINA
    useEffect(() => {
        const cargarCatalogo = async () => {
            setLoading(true);
            try {

                // PASAMOS LOS FILTROS Y LA PÁGINA ACTUAL
                const data = await filtrarProductos(filtros, currentPage, 6);
                setProductosReales(data.content);
                setTotalPages(data.totalPages);
                setError(null);
            } catch (err) {
                setError(err.message || "Error al cargar el catálogo");
            } finally {
                setLoading(false);
            }
        };

        cargarCatalogo();
    }, [filtros, currentPage]);

    const handleFilterChange = (key, value) => {
        setFiltros(prev => {
            if (prev[key] === value) {
                return { ...prev, [key]: '' };
            }
            return { ...prev, [key]: value };
        });

        // SI EL USUARIO CAMBIA UN FILTRO, VOLVEMOS A LA PRIMERA PÁGINA
        setCurrentPage(0);
    };

    const getGallery = (product) => {
        if (product.imageUrls && product.imageUrls.length > 0) {
            return [...new Set(product.imageUrls)];
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

    if (error) {
        return (
            <main className="productos-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="text-center text-danger prod-error">
                    <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <h3 className="fw-bold">{error}</h3>
                    <button className="btn btn-outline-danger mt-3" onClick={() => window.location.reload()}>Reintentar</button>
                </div>
            </main>
        );
    }

    return (
        <main className="productos-wrapper">

            <div className="prod-glow-container">
                <div className="prod-glow-blob prod-blob-blue"></div>
                <div className="prod-glow-blob prod-blob-purple"></div>
            </div>

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
                        <div className="prod-filter-sidebar position-sticky p-4" style={{ top: '180px' }}>
                            <h3 className="fw-bolder mb-4 text-white" style={{ letterSpacing: '-0.02em' }}>Filtros</h3>

                            {/* TALLAS (Grid de 2x3) */}
                            <div className="prod-filter-group mb-4">
                                <h4 className="small fw-bold mb-3" style={{ letterSpacing: '1px', fontSize: '0.75rem', color: '#a1a1a6' }}>TALLA</h4>

                                <div className="prod-size-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {['XS', 'S', 'M', 'L', 'XL', 'Única'].map(size => (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            key={size}
                                            type="button"
                                            className={`prod-size-btn ${filtros.size === size ? 'active' : ''}`}
                                            onClick={() => handleFilterChange('size', size)}
                                        >
                                            {size}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* CATEGORÍAS */}
                            <div className="prod-filter-group">
                                <h4 className="small fw-bold mb-3" style={{ letterSpacing: '1px', fontSize: '0.75rem', color: '#a1a1a6' }}>CATEGORÍAS</h4>

                                <ul className="list-unstyled p-0 m-0 d-flex flex-column gap-2 prod-scrollable-list">
                                    {[{ id: '', name: 'Todos' }, ...categorias].map(cat => (
                                        <li key={cat.id || 'todos'}>
                                            <button
                                                className={`prod-cat-btn ${filtros.categoryId === cat.id ? 'active' : ''}`}
                                                onClick={() => handleFilterChange('categoryId', cat.id)}
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
                            <span className="fw-semibold" style={{ fontSize: '14px', color: '#a1a1a6' }}>
                                Mostrando {productosReales.length} productos
                            </span>

                            {/* SELECTOR DE ORDENAMIENTO ESTILIZADO */}
                            <div className="prod-sort-wrapper">
                                <select
                                    className="prod-sort-select"
                                    value={filtros.sort}
                                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                                >
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
                                    <p className="fw-bold" style={{ color: '#a1a1a6' }}>Actualizando catálogo...</p>
                                </motion.div>
                            </div>
                        ) : productosReales.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prod-empty-state text-center py-5">
                                <i className="fas fa-search fa-3x mb-3" style={{ color: '#444' }}></i>
                                <h4 className="text-white">No hay resultados</h4>
                                <p>No encontramos productos que coincidan con tus filtros.</p>
                                <button className="btn btn-outline-light mt-2" onClick={() => setFiltros({ categoryId: '', size: '', sort: 'newest' })}>
                                    Limpiar Filtros
                                </button>
                            </motion.div>
                        ) : (
                            /* GRILLA ANIMADA */
                            <motion.div
                                className="row g-4"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {productosReales.map((product) => (
                                    <motion.div key={product.id} className="col-12 col-sm-6 col-md-4" variants={itemVariants}>
                                        <article className="prod-card d-flex flex-column">
                                            <div className="prod-image-wrap">

                                                {/* CONTENEDOR ÚNICO DE ETIQUETAS */}
                                                <div className="prod-badge-container d-flex flex-column align-items-start gap-2">
                                                    {product.sale && product.basePrice > 0 && (
                                                        <span className="prod-card-badge shadow-sm" style={{ backgroundColor: '#ff3b30', color: '#fff' }}>
                                                            OFERTA -{Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)}%
                                                        </span>
                                                    )}
                                                    {product.stock > 0 && product.stock <= 5 && (
                                                        <span className="prod-card-badge warning shadow-sm">
                                                            ¡ÚLTIMOS {product.stock}!
                                                        </span>
                                                    )}
                                                    {product.stock === 0 && (
                                                        <span className="prod-card-badge error shadow-sm">
                                                            AGOTADO
                                                        </span>
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

                                            <div className="prod-card-info d-flex flex-column flex-grow-1">

                                                {/* MINIATURAS */}
                                                <div className="prod-thumbs">
                                                    {getGallery(product).length > 1 && getGallery(product).map((thumb, index) => (
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

                                                <h3 className="prod-product-title mt-2">{product.name}</h3>
                                                <p className="prod-product-desc mb-2">
                                                    {product.description || "Equipamiento RUKI."}
                                                </p>

                                                {/* PRECIOS DINÁMICOS */}
                                                <div className="mb-3">
                                                    {product.sale ? (
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="text-danger fw-bold fs-5">${Number(product.salePrice).toLocaleString('es-CL')}</span>
                                                            <span className="text-decoration-line-through small" style={{ color: '#666' }}>${Number(product.basePrice).toLocaleString('es-CL')}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="fw-bold fs-5 text-white">${Number(product.basePrice).toLocaleString('es-CL')}</span>
                                                    )}
                                                </div>

                                                <div style={{ flexGrow: 1 }}></div>
                                            </div>
                                        </article>
                                    </motion.div>
                                ))}
                            </motion.div>


                        )}

                        {/* CONTROLES DE PAGINACIÓN */}
                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
                                <button
                                    className="btn btn-outline-light"
                                    disabled={currentPage === 0}
                                    onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0, 0); }}>
                                    <i className="fas fa-chevron-left"></i> Anterior
                                </button>
                                <span className="text-white fw-bold">
                                    Página {currentPage + 1} de {totalPages}
                                </span>
                                <button
                                    className="btn btn-outline-light"
                                    disabled={currentPage >= totalPages - 1}
                                    onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0, 0); }}>
                                    Siguiente <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        )}

                    </div>

                </div>
            </div>

            {/* TOAST NOTIFICATION SOLID STYLE */}
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