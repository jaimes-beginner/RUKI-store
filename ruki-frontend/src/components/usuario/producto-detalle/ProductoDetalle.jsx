import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { obtenerProductoPorId } from '../../../services/ProductoService';

export function ProductoDetalle() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imagenPrincipal, setImagenPrincipal] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });

    const mostrarToast = (mensaje, tipo) => {
        setToast({ mostrar: true, mensaje, tipo });
        setTimeout(() => setToast({ ...toast, mostrar: false }), 3000);
    };

    useEffect(() => {
        const cargarProducto = async () => {
            try {
                const data = await obtenerProductoPorId(id);
                setProducto(data);
                // Usamos placehold.co para evitar el error de conexión que daba via.placeholder.com
                setImagenPrincipal(data.imageUrls?.length > 0 ? data.imageUrls[0] : 'https://placehold.co/600x800/f5f5f7/86868b?text=Sin+Imagen');
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarProducto();
    }, [id]);

    if (loading) return <div className="text-center mt-5"><i className="fas fa-circle-notch fa-spin fa-3x" style={{color: '#1d1d1f'}}></i></div>;
    if (error) return <div className="text-center mt-5 text-danger"><h3>{error}</h3><button className="btn btn-dark mt-3" onClick={() => navigate('/productos')}>Volver</button></div>;

    return (
        <main style={{ backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: "'-apple-system', BlinkMacSystemFont, 'Inter', sans-serif" }}>
            <style>{`
                /* BOTÓN PRINCIPAL */
                .ios-btn-dark { 
                    background: #1d1d1f; 
                    color: #ffffff; 
                    border-radius: 12px; 
                    font-weight: 600; 
                    padding: 16px; 
                    border: none; 
                    transition: all 0.2s ease; 
                    letter-spacing: 0.02em;
                }
                .ios-btn-dark:hover:not(:disabled) { 
                    background: #000000; 
                    transform: translateY(-1px); 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .ios-btn-dark:disabled { 
                    background: #f5f5f7; 
                    color: #86868b; 
                    cursor: not-allowed; 
                }
                
                /* MINIATURAS CON SCROLL TÁCTIL (MÓVIL) */
                .thumb-galeria { 
                    border: 2px solid transparent; 
                    border-radius: 10px; 
                    overflow: hidden; 
                    cursor: pointer; 
                    transition: all 0.2s ease;
                    opacity: 0.6;
                    scroll-snap-align: start; /* Frena justo en la imagen al hacer swipe */
                }
                .thumb-galeria:hover { opacity: 0.8; }
                .thumb-galeria.active { 
                    border-color: #1d1d1f; 
                    opacity: 1;
                }
                
                /* OCULTAR BARRA DE SCROLL FEA EN MÓVILES */
                .scrollbar-hidden::-webkit-scrollbar { display: none; }
                .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; scroll-snap-type: x mandatory; }

                /* SELECTOR DE CANTIDAD PREMIUM (Cápsula unificada) */
                .qty-capsule {
                    display: inline-flex;
                    align-items: center;
                    background-color: #f5f5f7;
                    border-radius: 12px;
                    padding: 4px;
                }
                .qty-capsule-btn {
                    background: transparent;
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    font-size: 18px;
                    color: #1d1d1f;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: 0.2s;
                }
                .qty-capsule-btn:hover:not(:disabled) {
                    background-color: #e5e5ea;
                }
                .qty-capsule-btn:disabled {
                    color: #d2d2d7;
                    cursor: not-allowed;
                }
                .qty-capsule-value {
                    width: 40px;
                    text-align: center;
                    font-weight: 600;
                    font-size: 15px;
                    color: #1d1d1f;
                }
            `}</style>

            <div className="container py-3 py-md-5 mt-md-3">
                
                {/* BOTÓN VOLVER SUTIL */}
                <button className="btn btn-link text-muted text-decoration-none fw-semibold mb-3 px-0 d-inline-flex align-items-center" onClick={() => navigate(-1)} style={{ fontSize: '14px' }}>
                    <i className="fas fa-chevron-left me-2" style={{ fontSize: '12px' }}></i> Volver al catálogo
                </button>

                {/* LAYOUT PRINCIPAL DEL PRODUCTO (Ajustado para móvil con p-3 y g-4) */}
                <div className="row g-4 g-lg-5 align-items-start border rounded-4 p-3 p-md-4 mx-0" style={{ backgroundColor: '#ffffff' }}>
                    
                    {/* COLUMNA IZQUIERDA | IMAGEN PRINCIPAL Y GALERÍA */}
                    <div className="col-12 col-md-6 col-lg-6 px-0 px-md-3">
                        <div className="rounded-4 overflow-hidden mb-3" style={{ position: 'relative', backgroundColor: '#f5f5f7' }}>
                            {/* IMAGEN INTACTA (4/4) */}
                            <img src={imagenPrincipal} alt={producto.name} style={{ width: '100%', aspectRatio: '4/4', objectFit: 'cover' }} />
                            
                            {/* BADGE DE AGOTADO */}
                            {producto.stock === 0 && (
                                <span className="position-absolute top-0 start-0 m-3 px-3 py-2 fw-bold" style={{ backgroundColor: 'rgba(29, 29, 31, 0.8)', color: '#ffffff', borderRadius: '8px', fontSize: '11px', letterSpacing: '0.04em', backdropFilter: 'blur(4px)' }}>
                                    AGOTADO
                                </span>
                            )}
                        </div>

                        {/* MINIATURAS CON SCROLL TÁCTIL OCULTO */}
                        {producto.imageUrls?.length > 1 && (
                            <div className="d-flex gap-2 overflow-auto pb-2 scrollbar-hidden">
                                {producto.imageUrls.map((img, idx) => (
                                    <div key={idx} className={`thumb-galeria ${imagenPrincipal === img ? 'active' : ''}`} onClick={() => setImagenPrincipal(img)} style={{ width: '70px', height: '88px', flexShrink: 0 }}>
                                        <img src={img} alt={`miniatura ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* COLUMNA DERECHA: INFO Y ACCIONES */}
                    <div className="col-12 col-md-6 col-lg-5 offset-lg-1 d-flex flex-column pt-0 pt-md-3 px-0 px-md-3">
                        
                        {/* NOMBRE (Usa clamp para autoajustarse fluidamente) */}
                        <h1 className="fw-bolder mb-2 text-dark" style={{ letterSpacing: '-0.03em', fontSize: 'clamp(1.5rem, 4vw, 2rem)', lineHeight: '1.2' }}>
                            {producto.name}
                        </h1>
                        
                        {/* PRECIO DESTACADO (Usa clamp) */}
                        <p className="fw-bold mb-3 mb-md-4" style={{ color: '#1d1d1f', fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}>
                            ${Number(producto.basePrice).toLocaleString('es-CL')}
                        </p>
                        
                        {/* LÍNEA SEPARADORA SUTIL */}
                        <hr style={{ borderColor: '#e5e5ea', opacity: 1, margin: '0 0 20px 0' }} />

                        {/* DESCRIPCIÓN */}
                        <div className="mb-4">
                            <p style={{ color: '#515154', lineHeight: '1.6', fontSize: '15px' }}>
                                {producto.description || "No hay información adicional disponible para este producto."}
                            </p>
                        </div>

                        {/* SECTOR DE ACCIONES (Solo si hay stock) */}
                        {producto.stock > 0 && (
                            <div className="mb-4">
                                <p className="fw-semibold mb-2 text-dark" style={{ fontSize: '13px' }}>Selecciona la cantidad:</p>
                                <div className="d-flex align-items-center gap-3">
                                    
                                    {/* CÁPSULA DE CANTIDAD */}
                                    <div className="qty-capsule">
                                        <button className="qty-capsule-btn" onClick={() => setCantidad(Math.max(1, cantidad - 1))} disabled={cantidad <= 1}>
                                            <i className="fas fa-minus" style={{fontSize: '12px'}}></i>
                                        </button>
                                        <span className="qty-capsule-value">{cantidad}</span>
                                        <button className="qty-capsule-btn" onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))} disabled={cantidad >= producto.stock}>
                                            <i className="fas fa-plus" style={{fontSize: '12px'}}></i>
                                        </button>
                                    </div>

                                    {/* AVISO DE STOCK */}
                                    <span className="fw-medium" style={{ color: '#86868b', fontSize: '13px' }}>
                                        {producto.stock} disponibles
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* ESPACIO FLEXIBLE (Empuja el botón hacia abajo si hace falta) */}
                        <div style={{ flexGrow: 1 }}></div>

                        {/* BOTÓN AÑADIR AL CARRITO */}
                        <div className="mt-3 mt-md-4">
                            <button 
                                className="ios-btn-dark w-100" 
                                disabled={producto.stock === 0}
                                onClick={() => {
                                    addToCart(producto, cantidad);
                                    mostrarToast(`¡${cantidad}x ${producto.name} añadido al carrito!`, 'success');
                                }}
                            >
                                {producto.stock === 0 ? 'FUERA DE STOCK' : 'AÑADIR AL CARRITO'}
                            </button>
                            
                            {/* TEXTO DE GARANTÍA/ENVÍO */}
                            <p className="text-center mt-3 mb-0 fw-medium" style={{ color: '#86868b', fontSize: '12px' }}>
                                <i className="fas fa-truck me-2"></i> Envío calculado en el checkout.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* TOAST FLOTANTE DE NOTIFICACIÓN (Ajustado para no salirse en móvil) */}
            <div className="toast-container position-fixed bottom-0 end-0 p-3 p-md-4" style={{ zIndex: 1050, maxWidth: '100%' }}>
                <div className={`toast align-items-center bg-white ${toast.mostrar ? 'show' : 'hide'}`} role="alert" style={{ border: '3px solid #1d1d1f', borderRadius: '18px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
                    <div className="d-flex p-3 align-items-center">
                        <i className="fas fa-check-circle text-success fs-4 me-3"></i>
                        <div className="toast-body p-0 fw-semibold text-dark" style={{ fontSize: '14px' }}>
                            {toast.mensaje}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}