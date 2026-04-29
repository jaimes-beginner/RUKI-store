// src/components/Header.jsx
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import './NavbarUsuarios.css';

function Header() {
  return (
    <header className="ruki-header">
      {/* Parte superior: Logo y links de acceso */}
      <Navbar bg="dark" variant="dark" className="py-3 ruki-top-navbar">
        <Container fluid className="ruki-topbar d-flex justify-content-between align-items-center px-4 px-lg-5">
          <div className="ruki-topbar-side"></div> {/* Espaciador izquierdo */}
          
          <Navbar.Brand as={Link} to="/" className="ruki-brand-centered">
            <img src="/imagenes/logo.png" alt="RUKI logo" className="ruki-logo" />
          </Navbar.Brand>
          
          <div className="ruki-topbar-side d-flex justify-content-end align-items-center gap-3">
            <Nav.Link as={Link} to="/login" className="small p-0">Log in/Join</Nav.Link>
            <span className="cart-icon">🛒</span>
          </div>
        </Container>
      </Navbar>

      {/* Parte inferior: Navegación principal */}
      <Navbar bg="secondary" variant="dark" className="py-2 border-top border-dark ruki-bottom-navbar">
        <Container fluid className="px-4 px-lg-5">
          <Nav className="mx-auto gap-5">
            <NavLink to="/new-arrivals" className={({ isActive }) => `nav-link fw-bold small ${isActive ? 'nav-active' : ''}`}>NEW ARRIVALS</NavLink>
            <NavLink to="/productos" className={({ isActive }) => `nav-link fw-bold small ${isActive ? 'nav-active' : ''}`}>PRODUCTOS</NavLink>
            <NavLink to="/sale" className={({ isActive }) => `nav-link fw-bold small ${isActive ? 'nav-active' : ''}`}>SALE</NavLink>
          </Nav>
        </Container>
      </Navbar>
    </header>
  );
}

export default Header;