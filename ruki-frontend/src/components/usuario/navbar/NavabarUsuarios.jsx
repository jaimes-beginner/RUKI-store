// src/components/Header.jsx
import { useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './NavbarUsuarios.css';

function Header() {
  const [activeLink, setActiveLink] = useState(null);

  return (
    <header className="ruki-header">
      {/* Parte superior: Logo y links de acceso */}
      <Navbar bg="dark" variant="dark" className="py-3 ruki-top-navbar">
        <Container fluid className="ruki-topbar d-flex justify-content-between align-items-center px-4 px-lg-5">
          <div className="ruki-topbar-side"></div> {/* Espaciador izquierdo */}
          
          <Navbar.Brand href="/" className="ruki-brand-centered">
            <img src="/imagenes/logo.png" alt="RUKI logo" className="ruki-logo" />
          </Navbar.Brand>
          
          <div className="ruki-topbar-side d-flex justify-content-end align-items-center gap-3">
            <Nav.Link href="#login" className="small p-0">Log in/Join</Nav.Link>
            <span className="cart-icon">🛒</span>
          </div>
        </Container>
      </Navbar>

      {/* Parte inferior: Navegación principal */}
      <Navbar bg="secondary" variant="dark" className="py-2 border-top border-dark ruki-bottom-navbar">
        <Container fluid className="px-4 px-lg-5">
          <Nav
            className="mx-auto gap-5"
            activeKey={activeLink}
            onSelect={(selectedKey) => selectedKey && setActiveLink(selectedKey)}
          >
            <Nav.Link as={Link} to="/new-arrivals" eventKey="new" className="fw-bold small">NEW ARRIVALS</Nav.Link>
            <Nav.Link eventKey="productos" href="#productos" className="fw-bold small">PRODUCTOS</Nav.Link>
            <Nav.Link eventKey="sale" href="#sale" className="fw-bold small">SALE</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    </header>
  );
}

export default Header;