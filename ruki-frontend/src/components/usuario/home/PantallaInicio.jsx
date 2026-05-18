import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './PantallaInicio.css';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

function PantallaInicio() {
    const { isAuthenticated, usuario } = useAuth();

    return (
        <main className="saas-home-main">
            
            {/* FONDO INMERSIVO DE LUCES (GLOW) */}
            <div className="saas-glow-container">
                <div className="glow-blob blob-blue"></div>
                <div className="glow-blob blob-purple"></div>
                <div className="glow-blob blob-red"></div>
            </div>

            <div className="saas-content-wrapper">
                
                {/* HERO SECTION - LA VISIÓN */}
                <section className="saas-hero-section">
                    <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="text-center"
                    >
                        <motion.div variants={fadeInUp} className="saas-badge">
                            <span className="saas-badge-new">EST. 2026</span> RUKI PERFORMANCE CL
                        </motion.div>
                        
                        <motion.h1 variants={fadeInUp} className="saas-main-title">
                            Donde la <span className="saas-text-gradient-accent">Tecnología</span> <br />
                            se une al <span className="saas-text-gradient-white">Fitness.</span>
                        </motion.h1>
                        
                        <motion.p variants={fadeInUp} className="saas-main-subtitle">
                            RUKI no es solo una tienda de ropa deportiva; es una infraestructura diseñada para atletas que exigen lo máximo. Construida para resistir, creada para destacar en cada burpee, cada sprint y cada levantamiento.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="saas-hero-buttons">
                            <Link to="/productos" className="saas-btn saas-btn-primary">
                                Explorar Colección <i className="fas fa-shopping-bag ms-2"></i>
                            </Link>
                            
                            {!isAuthenticated ? (
                                <div className="d-flex gap-3">
                                    <Link to="/crear-usuario" className="saas-btn saas-btn-secondary">
                                        Crear Cuenta
                                    </Link>
                                    <Link to="/login" className="saas-btn saas-btn-outline">
                                        Iniciar Sesión
                                    </Link>
                                </div>
                            ) : (
                                <Link to={usuario?.role === 'ADMIN' ? '/admin/reporte-dashboard' : '/perfil/pedidos'} className="saas-btn saas-btn-secondary">
                                    <i className="fas fa-user-circle me-2"></i> Mi Panel de Control
                                </Link>
                            )}
                        </motion.div>
                    </motion.div>
                </section>

                {/* SECCIÓN DE SÍNTESIS / PILARES */}
                <section className="saas-philosophy-section">
                    <motion.div 
                        className="saas-features-grid"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div className="saas-feature-card" variants={fadeInUp}>
                            <div className="saas-feature-icon"><i className="fas fa-shield-heart"></i></div>
                            <h3>Calidad Blindada</h3>
                            <p>Telas con tecnología de compresión avanzada que se adaptan a tu piel, permitiendo una transpiración total y soporte muscular.</p>
                        </motion.div>

                        <motion.div className="saas-feature-card" variants={fadeInUp}>
                            <div className="saas-feature-icon"><i className="fas fa-microchip"></i></div>
                            <h3>Diseño Técnico</h3>
                            <p>Cada costura está pensada para evitar el roce y maximizar el rango de movimiento. Ingeniería chilena aplicada al deporte.</p>
                        </motion.div>

                        <motion.div className="saas-feature-card" variants={fadeInUp}>
                            <div className="saas-feature-icon"><i className="fas fa-infinity"></i></div>
                            <h3>Comunidad RUKI</h3>
                            <p>Únete a un ecosistema de deportistas. Sigue tus pedidos, recibe ofertas exclusivas y eleva tu nivel junto a nosotros.</p>
                        </motion.div>
                    </motion.div>
                </section>

                {/* PIE DE PÁGINA SIMPLE */}
                <footer className="saas-minimal-footer">
                    <p>© 2026 RUKI Store CL. Maipú, Chile. <br/> <small className="opacity-50">Construido con React + Spring Boot Microservices.</small></p>
                </footer>
            </div>
        </main>
    );
}

export default PantallaInicio;