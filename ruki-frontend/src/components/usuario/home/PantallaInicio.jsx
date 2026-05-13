import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import './PantallaInicio.css';

const categories = [
    { title: 'Accesorios', image: '/imagenes/wallpaper.jpg' },
    { title: 'Shorts', image: '/imagenes/walpaper 2.jpg' },
    { title: 'Polerones', image: '/imagenes/fondo.jpeg' },
    { title: 'Polera', image: '/imagenes/wallpaper.jpg' },
];

const products = [
    { name: 'Poleron Crossfit On Fire', price: 14900, image: '/imagenes/walpaper 2.jpg' },
    { name: 'Polera NO MORE BURPEES', price: 15900, image: '/imagenes/fondo.jpeg' },
    { name: 'Polera Sailor Moon', price: 15900, image: '/imagenes/wallpaper.jpg' },
    { name: 'Short Performance Black', price: 18900, image: '/imagenes/walpaper 2.jpg' },
    { name: 'Mochila Utility RUKI', price: 22900, image: '/imagenes/wallpaper.jpg' },
];

// Animaciones base para Framer Motion
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

function PantallaInicio() {
    const [slideIndex, setSlideIndex] = useState(0);
    const [cardsPerView, setCardsPerView] = useState(3);

    useEffect(() => {
        const syncCards = () => {
            if (window.innerWidth <= 640) { setCardsPerView(1); return; }
            if (window.innerWidth <= 980) { setCardsPerView(2); return; }
            setCardsPerView(3);
        };
        syncCards();
        window.addEventListener('resize', syncCards);
        return () => window.removeEventListener('resize', syncCards);
    }, []);

    const maxSlideIndex = useMemo(
        () => Math.max(0, products.length - cardsPerView),
        [cardsPerView, products.length],
    );

    useEffect(() => {
        if (slideIndex > maxSlideIndex) setSlideIndex(maxSlideIndex);
    }, [slideIndex, maxSlideIndex]);

    useEffect(() => {
        if (maxSlideIndex === 0) return undefined;
        const timer = window.setInterval(() => {
            setSlideIndex((current) => (current >= maxSlideIndex ? 0 : current + 1));
        }, 5000); 
        return () => window.clearInterval(timer);
    }, [maxSlideIndex]);

    const handlePrev = () => setSlideIndex((current) => (current <= 0 ? maxSlideIndex : current - 1));
    const handleNext = () => setSlideIndex((current) => (current >= maxSlideIndex ? 0 : current + 1));

    return (
        <main className="ios-home-main">
            {/* LUCES AMBIENTALES DE FONDO */}
            <div className="ios-ambient-blob blob-1"></div>
            <div className="ios-ambient-blob blob-2"></div>

            <div className="ios-home-main-inner">
                
                {/* HERO BANNER - Animación de entrada */}
                <motion.section 
                    className="ios-hero-banner"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <motion.img 
                        src="/imagenes/fondo.jpeg" 
                        alt="Welcome to RUKI" 
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 4, ease: "easeOut" }}
                    />
                    <div className="ios-hero-mask"></div>
                    
                    <div className="ios-hero-content">
                        <motion.div 
                            className="ios-hero-badge-glass"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <span className="sparkle"></span> Colección 2026
                        </motion.div>
                        <h1>
                            Eleva tu <br />
                            <span className="text-gradient">Performance</span>
                        </h1>
                        <p>Diseñado para resistir. Creado para destacar.</p>
                    </div>
                </motion.section>

                {/* CATEGORÍAS */}
                <motion.section 
                    className="ios-category-grid" 
                    aria-label="Categorias"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    {categories.map((category) => (
                        <motion.article 
                            key={category.title} 
                            className="ios-category-card"
                            variants={fadeInUp}
                            whileHover={{ y: -8, scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <img src={category.image} alt={category.title} />
                            {/* Píldora de cristal flotante en lugar de texto plano */}
                            <div className="ios-category-label-glass">
                                <span>{category.title}</span>
                                <i className="fas fa-arrow-right"></i>
                            </div>
                        </motion.article>
                    ))}
                </motion.section>

                {/* PRODUCTOS DESTACADOS */}
                <motion.section 
                    className="ios-products-section" 
                    aria-label="Nuevos productos"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={fadeInUp}
                >
                    <div className="ios-section-header">
                        <div>
                            <h3>Nuevos Lanzamientos</h3>
                            <p className="ios-section-subtitle">El equipamiento que necesitas hoy.</p>
                        </div>
                        <span className="ios-badge-glass">Lo último</span>
                    </div>

                    <div className="ios-carousel-wrap">
                        <motion.button 
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            type="button" className="ios-carousel-btn left" onClick={handlePrev} aria-label="Anterior"
                        >
                            <i className="fas fa-chevron-left"></i>
                        </motion.button>

                        <div className="ios-carousel-viewport">
                            <div
                                className="ios-carousel-track"
                                style={{ transform: `translateX(-${(slideIndex * 100) / cardsPerView}%)` }}
                            >
                                {products.map((product) => (
                                    <div key={product.name} className="ios-product-slide">
                                        <motion.article 
                                            className="ios-product-card"
                                            whileHover={{ y: -8, boxShadow: "0 24px 48px rgba(0,0,0,0.06)" }}
                                        >
                                            <div className="ios-product-img-wrapper">
                                                <img src={product.image} alt={product.name} />
                                                <motion.button 
                                                    className="ios-quick-add-btn"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <i className="fas fa-plus"></i>
                                                </motion.button>
                                            </div>
                                            <div className="ios-product-meta">
                                                <p className="ios-product-name">{product.name}</p>
                                                <p className="ios-product-price">
                                                    ${product.price.toLocaleString('es-CL')}
                                                </p>
                                            </div>
                                        </motion.article>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <motion.button 
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            type="button" className="ios-carousel-btn right" onClick={handleNext} aria-label="Siguiente"
                        >
                            <i className="fas fa-chevron-right"></i>
                        </motion.button>
                    </div>

                    <div className="ios-carousel-dots">
                        {Array.from({ length: maxSlideIndex + 1 }).map((_, index) => (
                            <button
                                key={`dot-${index}`}
                                type="button"
                                className={`ios-dot ${slideIndex === index ? 'active' : ''}`}
                                onClick={() => setSlideIndex(index)}
                                aria-label={`Ir a la diapositiva ${index + 1}`}
                            ></button>
                        ))}
                    </div>
                </motion.section>
            </div>
        </main>
    );
}

export default PantallaInicio;