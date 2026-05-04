import './FooterUsuario.css';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="ruki-footer">
      <div className="ruki-footer-top">
        <a href="/faq" className="ruki-top-item">
          <span className="ruki-top-icon" aria-hidden="true">?</span>
          <span className="ruki-top-label">FAQ</span>
        </a>

        <a
          href="https://www.google.com/maps/search/Crossfit/@-33.4946527,-70.7525297,15z/data=!3m1!4b1?entry=ttu&g_ep=EgoyMDI2MDQyOS4wIKXMDSoASAFQAw%3D%3D"
          className="ruki-top-item"
          target="_blank"
          rel="noreferrer"
        >
          <span className="ruki-top-icon" aria-hidden="true">⌖</span>
          <span className="ruki-top-label">Encuentra tu box</span>
        </a>
      </div>

      <div className="ruki-footer-main">
        <div className="ruki-footer-main-inner">
          <a href="/noticias" className="ruki-footer-card" aria-label="Ir al blog de RUKI">
            <img src="/imagenes/logo.png" alt="RUKI" className="ruki-footer-logo" />
            <div>
              <p className="ruki-card-title">Explora aqui</p>
              <span className="ruki-card-subtitle">Expande tus conocimientos</span>
            </div>
          </a>

          <nav className="ruki-footer-links" aria-label="Footer links">
            <div className="ruki-footer-column">
              <h3>TIENDA</h3>
              <Link to="/">Inicio</Link>
              <Link to="/new-arrivals">New Arrivals</Link>
              <Link to="/productos">Productos</Link>
              <Link to="/sale">Sale</Link>
            </div>

            <div className="ruki-footer-divider" aria-hidden="true"></div>

            <div className="ruki-footer-column">
              <h3>AYUDA</h3>
              <a href="/faq">FAQ</a>
              <a href="/faq#devolucion">Politica de Devolucion</a>
              <a href="/faq#terminos">Terminos y Condiciones</a>
            </div>
          </nav>
        </div>
      </div>

      <div className="ruki-footer-bottom">
        <p>© RUKI S.A RUT: 96.575.290-3. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;
