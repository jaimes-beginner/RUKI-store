import { useState } from 'react';
import { Navbar, Nav, Container, Offcanvas, Badge, Dropdown } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './NavbarUsuarios.css';

function Header() {
  const { cart, cartCount, cartTotalAmount, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated, usuario, logout } = useAuth();
  
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => setShowCart(false);
  const handleShow = () => setShowCart(true);

  const irAlCheckout = () => {
    setShowCart(false);
    navigate('/checkout'); 
  };

  return (
    <>
      <header className="ruki-header">
        {/* BARRA SUPERIOR OSCURA */}
        <Navbar variant="dark" className="py-3 ruki-top-navbar">
          <Container fluid className="ruki-topbar d-flex justify-content-between align-items-center px-4 px-lg-5">
            <div className="ruki-topbar-side"></div> 
            
            <Navbar.Brand as={Link} to="/" className="ruki-brand-centered">
              <img src="/imagenes/logo.png" alt="RUKI logo" className="ruki-logo" />
            </Navbar.Brand>
            
            <div className="ruki-topbar-side d-flex justify-content-end align-items-center gap-3">
              
              {/* LÓGICA DE SESIÓN */}
              {isAuthenticated ? (
                <Dropdown align="end">
                  <Dropdown.Toggle 
                    variant="link" 
                    id="user-dropdown" 
                    className="text-white small fw-bold text-decoration-none p-0 border-0"
                  >
                    Hola, {usuario?.firstName || 'Usuario'}
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="ios-dropdown-menu">
                    <Dropdown.Item as={Link} to="/mi-perfil" className="py-2 ios-dropdown-item">
                      <i className="fas fa-user-circle me-2 text-secondary"></i> Mi Perfil
                    </Dropdown.Item>

                    <Dropdown.Item as={Link} to="/mis-pedidos" className="py-2 ios-dropdown-item">
                      <i className="fas fa-box me-2 text-secondary"></i> Mis Pedidos
                    </Dropdown.Item>
                    
                    <Dropdown.Divider className="ios-divider" />
                    
                    <Dropdown.Item 
                      onClick={() => {
                        logout();
                        navigate('/');
                      }} 
                      className="py-2 text-danger ios-dropdown-item"
                    >
                      <i className="fas fa-sign-out-alt me-2"></i> Cerrar Sesión
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Nav.Link as={Link} to="/login" className="small p-0 text-white fw-medium">
                  Log in/Join
                </Nav.Link>
              )}
              
              {/* BOTÓN DEL CARRITO */}
              <div className="ios-cart-btn" onClick={handleShow}>
                <span className="fs-5">🛒</span>
                {cartCount > 0 && (
                  <Badge bg="danger" pill className="ios-cart-badge">
                    {cartCount}
                  </Badge>
                )}
              </div>

            </div>
          </Container>
        </Navbar>

        {/* BARRA INFERIOR CLARA (ENLACES) */}
        <Navbar className="py-2 ruki-bottom-navbar border-top border-dark">
          <Container fluid className="px-4 px-lg-5">
            <Nav className="mx-auto gap-2 gap-md-5">
              <NavLink to="/new-arrivals" className={({ isActive }) => `ruki-nav-link text-decoration-none ${isActive ? 'nav-active' : ''}`}>NEW ARRIVALS</NavLink>
              <NavLink to="/productos" className={({ isActive }) => `ruki-nav-link text-decoration-none ${isActive ? 'nav-active' : ''}`}>PRODUCTOS</NavLink>
              <NavLink to="/sale" className={({ isActive }) => `ruki-nav-link text-decoration-none ${isActive ? 'nav-active' : ''}`}>SALE</NavLink>
            </Nav>
          </Container>
        </Navbar>
      </header>

      {/* PANEL LATERAL DEL CARRITO */}
      <Offcanvas show={showCart} onHide={handleClose} placement="end" className="ios-offcanvas">
        <Offcanvas.Header closeButton className="ios-offcanvas-header">
          <Offcanvas.Title className="fw-bolder text-dark m-0" style={{ letterSpacing: '-0.02em' }}>
            Tu Carrito <span className="text-secondary fw-medium">({cartCount})</span>
          </Offcanvas.Title>
        </Offcanvas.Header>
        
        <Offcanvas.Body className="d-flex flex-column p-0 bg-white">
          {cart.length === 0 ? (
            <div className="text-center mt-5 p-4 text-muted">
              <div className="ios-empty-cart-icon">
                <i className="fas fa-shopping-bag fa-2x text-secondary"></i>
              </div>
              <h5 className="fw-bolder text-dark mb-2">Tu carrito está vacío</h5>
              <p className="small mb-4 text-secondary">Aún no has agregado ningún producto.</p>
              <button className="ios-btn-outline w-100" onClick={handleClose}>
                SEGUIR COMPRANDO
              </button>
            </div>
          ) : (
            <>
              {/* LISTA DE PRODUCTOS ANIMADA */}
              <div className="flex-grow-1" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
                <AnimatePresence>
                  {cart.map(item => (
                    <motion.div 
                      key={item.id} 
                      layout
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                      className="d-flex align-items-center ios-cart-item"
                    >
                      {/* Imagen */}
                      <div className="ios-cart-img-wrapper">
                        <img 
                          src={item.imageUrls && item.imageUrls[0] ? item.imageUrls[0] : 'https://via.placeholder.com/80'} 
                          alt={item.name} 
                          className="ios-cart-img" 
                        />
                      </div>
                      
                      {/* Detalles */}
                      <div className="flex-grow-1">
                        <h6 className="ios-cart-title fw-bold text-dark mb-1">{item.name}</h6>
                        <p className="ios-cart-price mb-2 fw-semibold">
                          ${Number(item.basePrice).toLocaleString('es-CL')}
                        </p>
                        
                        {/* Controles */}
                        <div className="d-flex align-items-center">
                          <button className="ios-btn-icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                          <span className="ios-cart-qty">{item.quantity}</span>
                          <button className="ios-btn-icon" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}>+</button>
                        </div>
                      </div>
                      
                      {/* Basurero */}
                      <button className="btn btn-link text-danger p-2 ms-2 text-decoration-none" onClick={() => removeFromCart(item.id)}>
                        <i className="fas fa-trash-alt" style={{ fontSize: '14px' }}></i>
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* RESUMEN Y BOTÓN DE PAGO */}
              <div className="ios-cart-footer">
                <div className="d-flex justify-content-between mb-3 fw-bolder text-dark fs-5" style={{ letterSpacing: '-0.02em' }}>
                  <span>Total</span>
                  <span>${cartTotalAmount.toLocaleString('es-CL')}</span>
                </div>
                <button className="ios-btn-dark w-100" onClick={irAlCheckout}>
                  FINALIZAR COMPRA
                </button>
              </div>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Header;