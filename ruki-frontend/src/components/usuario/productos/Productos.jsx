import { useState, useEffect } from 'react';
import { useCart } from '../../../contexts/CartContext'; 
import { obtenerProductosActivos } from '../../../services/ProductoService'; 
import '../newarrivals/NewArriivals.css';
import './Productos.css';

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
            <main className="new-arrivals-page products-page d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
                <div className="text-center">
                    <i className="fas fa-circle-notch fa-spin fa-3x mb-3" style={{color: '#1d1d1f'}}></i>
                    <h3 style={{fontFamily: "'Inter', sans-serif", fontWeight: '700', letterSpacing: '-0.02em'}}>Cargando catálogo...</h3>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="new-arrivals-page products-page d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
                <div className="text-center text-danger">
                    <i className="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <h3 style={{fontFamily: "'Inter', sans-serif", fontWeight: '700'}}>{error}</h3>
                </div>
            </main>
        );
    }

    return (
        <main className="new-arrivals-page products-page position-relative" style={{fontFamily: "'-apple-system', BlinkMacSystemFont, 'Inter', sans-serif", backgroundColor: '#f5f5f7'}}>
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

                /* 1. MANTENER TU LAYOUT ORIGINAL Y FRENAR EL FILTRO */
                .na-filter {
                    background: #ffffff;
                    border: 1.5px solid #e5e5ea;
                    border-radius: 16px;
                    padding: 20px;
                    height: fit-content !important; /* El tamaño justo */
                    position: sticky !important;    /* Te acompaña al bajar */
                    top: 20px !important;
                }

                /* 2. HACER TU GRILLA ORIGINAL MÁS COMPACTA */
                .na-grid {
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important;
                    gap: 16px !important;
                }

                /* ESTILOS IOS PARA LAS TARJETAS */
                .ios-card {
                    background: #ffffff;
                    border: 1.5px solid #e5e5ea;
                    border-radius: 16px;
                    transition: all 0.3s ease;
                    overflow: hidden;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .ios-card:hover {
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
                    transform: translateY(-2px);
                    border-color: #d2d2d7;
                }
                
                .ios-btn {
                    font-family: 'Inter', sans-serif !important;
                    font-size: 11px;
                    font-weight: 700;
                    border-radius: 10px;
                    padding: 10px;
                    border: 1.5px solid #1d1d1f;
                    transition: all 0.2s;
                    letter-spacing: 0.02em;
                }
                .ios-btn-dark { background: #1d1d1f; color: #ffffff; }
                .ios-btn-dark:hover { background: #000000; color: #ffffff; }
                .ios-btn-outline { background: #ffffff; color: #1d1d1f; border-color: #d2d2d7;}
                .ios-btn-outline:hover { background: #f5f5f7; border-color: #1d1d1f;}

                .ios-thumb-btn {
                    border: 2px solid transparent;
                    border-radius: 6px;
                    overflow: hidden;
                    padding: 0;
                    background: transparent;
                    transition: all 0.2s;
                    width: 28px;
                    height: 28px;
                }
                .ios-thumb-btn.is-active {
                    border-color: #1d1d1f;
                    transform: scale(1.05);
                }
                .ios-thumb-btn img {
                    border-radius: 4px;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                /* LÍMITE VERTICAL PARA DESCRIPCIÓN */
                .product-description-clamp {
                    display: -webkit-box;
                    -webkit-line-clamp: 2; 
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-size: 11px;
                    color: #86868b;
                    line-height: 1.3;
                    min-height: 28px;
                }
            `}</style>

            <section className="na-content py-4 container">
                
                {/* PANEL DE FILTROS LATERAL (AHORA USA TU CLASE ORIGINAL 'na-filter') */}
                <aside className="na-filter mb-4 mb-md-0">
                    <p className="fw-bolder mb-3" style={{ fontSize: '14px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#86868b' }}>Filtro</p>

                    <div className="na-filter-block">
                        <p className="fw-bold mb-2 text-dark" style={{fontSize: '13px'}}>Talla</p>
                        <div className="d-flex flex-wrap gap-2">
                            <button type="button" className="ios-btn ios-btn-outline py-1 px-3">XS</button>
                            <button type="button" className="ios-btn ios-btn-outline py-1 px-3">S</button>
                            <button type="button" className="ios-btn ios-btn-outline py-1 px-3">M</button>
                            <button type="button" className="ios-btn ios-btn-outline py-1 px-3">L</button>
                        </div>
                    </div>
                </aside>

                {/* ÁREA DE PRODUCTOS (USA TU CLASE ORIGINAL 'na-products') */}
                <div className="na-products">
                    <div className="mb-4 pb-2 border-bottom" style={{ borderColor: '#e5e5ea' }}>
                        <h2 className="fw-bolder text-dark mb-1" style={{ letterSpacing: "-0.03em", fontSize: "2rem" }}>Productos</h2>
                        <p className="text-secondary fw-medium mb-0" style={{ color: "#86868b", fontSize: '14px' }}>Todos tus productos a solo un click.</p>
                    </div>

                    {productosReales.length === 0 && (
                        <div className="text-center py-5 text-muted fw-bold ios-card">
                            <i className="fas fa-box-open fa-3x mb-3" style={{ color: '#d2d2d7' }}></i>
                            <p>No hay productos disponibles en este momento.</p>
                        </div>
                    )}

                    {/* GRILLA (USA TU CLASE ORIGINAL 'na-grid') */}
                    <div className="na-grid">
                        {productosReales.map((product) => (
                            <article key={product.id} className="na-card ios-card p-2">

                                <div className="na-image-wrap rounded-3 overflow-hidden position-relative mb-2" style={{ background: '#f5f5f7' }}>
                                    {/* IMAGEN 4/5 ASEGURADA */}
                                    <img src={getDisplayImage(product)} alt={product.name} style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover' }} />
                                    
                                    {/* BADGES ORIGINALES FLOTANDO */}
                                    <div className="position-absolute top-0 start-0 p-2" style={{ zIndex: 20 }}>
                                        {product.stock > 0 && product.stock <= 5 && (
                                            <span className="na-badge products-badge-sale">¡ÚLTIMOS {product.stock}!</span>
                                        )}
                                        {product.stock === 0 && (
                                            <span className="na-badge" style={{background: '#1d1d1f', color: '#fff'}}>AGOTADO</span>
                                        )}
                                    </div>
                                </div>

                                {/* CONTENEDOR COMPACTO DE TEXTOS */}
                                <div className="d-flex flex-column flex-grow-1 px-1">
                                    
                                    <h3 className="fw-bolder text-dark mb-1" style={{ fontSize: '13px', letterSpacing: '-0.01em', lineHeight: '1.2' }}>
                                        {product.name}
                                    </h3>

                                    <p className="product-description-clamp mb-2">
                                        {product.description || "Descripción no disponible para este producto."}
                                    </p>

                                    <p className="fw-bolder mb-2" style={{ color: '#1d1d1f', fontSize: '15px' }}>
                                        ${Number(product.basePrice).toLocaleString('es-CL')}
                                    </p>

                                    <div className="d-flex gap-1 mb-2">
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

                                    <button 
                                        className={`ios-btn w-100 mt-1 ${product.stock > 0 ? 'ios-btn-dark' : ''}`}
                                        style={product.stock === 0 ? {
                                            backgroundColor: '#f5f5f7', color: '#86868b', borderColor: '#e5e5ea', cursor: 'not-allowed'
                                        } : {}}
                                        onClick={() => {
                                            addToCart(product, 1);
                                            mostrarToast(`¡${product.name} añadido!`, 'success');
                                        }}
                                        disabled={product.stock === 0}
                                    >
                                        {product.stock === 0 ? 'SIN STOCK' : 'AÑADIR'}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <div className="toast-container position-fixed bottom-0 end-0 p-4" style={{ zIndex: 1050 }}>
                <div className={`toast align-items-center bg-white ${toast.mostrar ? 'show' : 'hide'}`} 
                     role="alert" aria-live="assertive" aria-atomic="true" 
                     style={{ border: '3px solid #1d1d1f', borderRadius: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                    <div className="d-flex p-2">
                        <div className="toast-body fw-bold text-dark" style={{ fontSize: "12px" }}>
                            {toast.tipo === 'success' ? <i className="fas fa-check text-success me-2"></i> : <i className="fas fa-exclamation-triangle text-danger me-2"></i>}
                            {toast.mensaje}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}