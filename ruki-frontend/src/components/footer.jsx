import './footer.css';

function Footer() {
  return (
    <footer className="ruki-footer">
      <div className="ruki-footer-top">
        <a href="#box" className="ruki-top-item">
          <span className="ruki-top-icon" aria-hidden="true">⌖</span>
          <span className="ruki-top-label">Encuentra tu box</span>
        </a>
        <a href="#giftcard" className="ruki-top-item">
          <span className="ruki-top-icon" aria-hidden="true">🎁</span>
          <span className="ruki-top-label">Gift Card</span>
        </a>
        <a href="#faq" className="ruki-top-item">
          <span className="ruki-top-icon" aria-hidden="true">?</span>
          <span className="ruki-top-label">FAQ</span>
        </a>
      </div>

      <div className="ruki-footer-main">
        <div className="ruki-footer-main-inner">
          <div className="ruki-footer-card">
            <img src="/imagenes/logo.png" alt="RUKI" className="ruki-footer-logo" />
            <div>
              <p className="ruki-card-title">Explora aqui</p>
              <p className="ruki-card-subtitle">Expande tu conocimiento</p>
            </div>
          </div>

          <nav className="ruki-footer-links" aria-label="Footer links">
            <div className="ruki-footer-column">
              <h3>TIENDA</h3>
              <a href="#inicio">Inicio</a>
              <a href="#productos">Productos</a>
              <a href="#blog">Blog</a>
              <a href="#contacto">Contacto</a>
            </div>

            <div className="ruki-footer-divider" aria-hidden="true"></div>

            <div className="ruki-footer-column">
              <h3>AYUDA</h3>
              <a href="#faq">FAQ</a>
              <a href="#devolucion">Politica de Devolucion</a>
              <a href="#terminos">Terminos y Condiciones</a>
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
