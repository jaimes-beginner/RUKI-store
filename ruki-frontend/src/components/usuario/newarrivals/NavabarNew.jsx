// src/components/Header.jsx
import { useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './NavbarNew.css';

function Header() {
  const [activeLink, setActiveLink] = useState(null);

  return (
    <header className="ruki-header-new">
      {/* Parte superior: Logo y links de acceso */}
      <Navbar bg="light" variant="light" className="py-3 ruki-top-navbar-new">
        <Container fluid className="ruki-topbar-new d-flex justify-content-between align-items-center px-4 px-lg-5">
          <div className="ruki-topbar-side-new"></div> {/* Espaciador izquierdo */}
          
          <Navbar.Brand as={Link} to="/" className="ruki-brand-centered-new">
            <img src="/imagenes/logo_black.png" alt="RUKI logo" className="ruki-logo-new" />
          </Navbar.Brand>
          
          <div className="ruki-topbar-side-new d-flex justify-content-end align-items-center gap-3">
            <Nav.Link href="#login" className="small p-0">Log in/Join</Nav.Link>
            <span className="cart-icon-new">🛒</span>
          </div>
        </Container>
      </Navbar>

      {/* Parte inferior: Navegación principal */}
      <Navbar bg="light" variant="light" className="py-2 border-top ruki-bottom-navbar-new">
        <Container fluid className="px-4 px-lg-5">
          <Nav
            className="mx-auto gap-5"
            activeKey={activeLink}
            onSelect={(selectedKey) => selectedKey && setActiveLink(selectedKey)}
          >
            <Nav.Link as={Link} to="/new-arrivals" eventKey="new" className="fw-bold small">NEW ARRIVALS</Nav.Link>
            <Nav.Link eventKey="productos" href="#productos" className="fw-bold small">PRODUCTOS</Nav.Link>
            <Nav.Link as={Link} to="/sale" eventKey="sale" className="fw-bold small">SALE</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    </header>
  );
}

export default Header;