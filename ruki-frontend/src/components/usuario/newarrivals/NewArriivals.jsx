import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './NewArriivals.css';

const products = [
    {
        id: 1,
        name: 'Buzo Black Performance',
        price: 14900,
        image: '/imagenes/wallpaper.jpg',
        thumbs: ['/imagenes/wallpaper.jpg', '/imagenes/walpaper 2.jpg', '/imagenes/fondo.jpeg'],
    },
    {
        id: 2,
        name: 'Calcetas High Grip',
        price: 15900,
        image: '/imagenes/walpaper 2.jpg',
        thumbs: ['/imagenes/walpaper 2.jpg', '/imagenes/fondo.jpeg'],
    },
    {
        id: 3,
        name: 'Polera Ruki Core',
        price: 13900,
        image: '/imagenes/fondo.jpeg',
        thumbs: ['/imagenes/fondo.jpeg', '/imagenes/wallpaper.jpg'],
    },
    {
        id: 4,
        name: 'Short Motion Pro',
        price: 16900,
        image: '/imagenes/wallpaper.jpg',
        thumbs: ['/imagenes/wallpaper.jpg', '/imagenes/walpaper 2.jpg'],
    },
    {
        id: 5,
        name: 'Polerón Street Oversized',
        price: 18900,
        image: '/imagenes/walpaper 2.jpg',
        thumbs: ['/imagenes/walpaper 2.jpg', '/imagenes/fondo.jpeg'],
    },
    {
        id: 6,
        name: 'Mochila Utility Tactical',
        price: 22900,
        image: '/imagenes/fondo.jpeg',
        thumbs: ['/imagenes/fondo.jpeg', '/imagenes/wallpaper.jpg'],
    },
];

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
    const [selectedImages, setSelectedImages] = useState({});

    const getGallery = (product) => [...new Set([product.image, ...product.thumbs])]; 
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
                            <span className="fw-semibold text-secondary" style={{fontSize: '14px'}}>Mostrando {products.length} productos</span>
                            <select className="na-sort-select">
                                <option>Más recientes</option>
                                <option>Precio: Menor a Mayor</option>
                                <option>Precio: Mayor a Menor</option>
                            </select>
                        </div>

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
                                            
                                            {/* ETIQUETA DE NUEVO */}
                                            <div className="na-card-badge">NEW</div>
                                            
                                            {/* TRANSICIÓN SUAVE DE IMAGENES */}
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
                                        </div>

                                        <div className="na-card-info">
                                            <div className="na-thumbs">
                                                {getGallery(product).map((thumb, index) => (
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
                                            <p className="na-product-price">${product.price.toLocaleString('es-CL')}</p>
                                        </div>
                                    </article>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                </div>
            </div>
        </main>
    );
}