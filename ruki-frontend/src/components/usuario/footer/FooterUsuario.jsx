import './FooterUsuario.css';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Footer() {
  return (
    <footer className="ruki-footer-glass">
      
      {/* SECCIÓN SUPERIOR (FAQ y Mapa) */}
      <div className="ruki-footer-top-glass">
        <motion.a 
          href="/faq" 
          className="ruki-top-item"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="ruki-icon-wrapper">
            <span className="ruki-top-icon" aria-hidden="true">?</span>
          </div>
          <span className="ruki-top-label">FAQ</span>
        </motion.a>

        <motion.a
          href="https://www.google.com/maps/search/Crossfit/@-33.4946527,-70.7525297,15z/data=!3m1!4b1?entry=ttu&g_ep=EgoyMDI2MDQyOS4wIKXMDSoASAFQAw%3D%3D"
          className="ruki-top-item"
          target="_blank"
          rel="noreferrer"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="ruki-icon-wrapper">
            <span className="ruki-top-icon" aria-hidden="true">⌖</span>
          </div>
          <span className="ruki-top-label">Encuentra tu box</span>
        </motion.a>
      </div>

      {/* SECCIÓN PRINCIPAL */}
      <div className="ruki-footer-main-glass">
        <div className="ruki-footer-main-inner">
          
          {/* Tarjeta con efecto Glass y Físicas */}
          <motion.a 
            href="/noticias" 
            className="ruki-footer-card-glass" 
            aria-label="Ir al blog de RUKI"
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <img src="/imagenes/logo.png" alt="RUKI" className="ruki-footer-logo" />
            <div>
              <p className="ruki-card-title">Explora aquí</p>
              <span className="ruki-card-subtitle">Expande tus conocimientos</span>
            </div>
          </motion.a>

          <nav className="ruki-footer-links" aria-label="Footer links">
            <div className="ruki-footer-column">
              <h3>TIENDA</h3>
              <motion.div whileHover={{ x: 6 }}><Link to="/">Inicio</Link></motion.div>
              <motion.div whileHover={{ x: 6 }}><Link to="/new-arrivals">New Arrivals</Link></motion.div>
              <motion.div whileHover={{ x: 6 }}><Link to="/productos">Productos</Link></motion.div>
              <motion.div whileHover={{ x: 6 }}><Link to="/sale">Sale</Link></motion.div>
            </div>

            <div className="ruki-footer-divider" aria-hidden="true"></div>

            <div className="ruki-footer-column">
              <h3>AYUDA</h3>
              <motion.div whileHover={{ x: 6 }}><a href="/faq">FAQ</a></motion.div>
              <motion.div whileHover={{ x: 6 }}><a href="/faq#devolucion">Política de Devolución</a></motion.div>
              <motion.div whileHover={{ x: 6 }}><a href="/faq#terminos">Términos y Condiciones</a></motion.div>
            </div>
          </nav>
        </div>
      </div>

      {/* SECCIÓN INFERIOR */}
      <div className="ruki-footer-bottom-glass">
        <p>© {new Date().getFullYear()} RUKI S.A RUT: 96.575.290-3. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;