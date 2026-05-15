import { useState } from 'react';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './NavbarUsuarios.css';

function Header() {
  const { cart, cartCount, cartTotalAmount, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated, usuario, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
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
        <Navbar variant="dark" className="py-4 ruki-top-navbar">
          <Container fluid className="ruki-topbar d-flex justify-content-between align-items-center px-4 px-lg-5">
            <div className="ruki-topbar-side"></div> 
            
            <Navbar.Brand as={Link} to="/" className="ruki-brand-centered">
              <img src="/imagenes/logo.png" alt="RUKI logo" className="ruki-logo" />
            </Navbar.Brand>
            
            <div className="ruki-topbar-side d-flex justify-content-end align-items-center gap-3">
              
              {/* LÓGICA DE SESIÓN */}
              {isAuthenticated ? (
                <div className="position-relative">
                  <button 
                    className="user-dropdown-toggle bg-transparent text-decoration-none p-0 border-0 d-flex align-items-center gap-2"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <div className="user-avatar-mini">
                      {usuario?.firstName ? usuario.firstName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="d-none d-md-inline text-white small fw-bold">
                      {usuario?.firstName || 'Mi Cuenta'}
                    </span>
                    <motion.div animate={{ rotate: userMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#86868b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </motion.div>
                  </button>

                  {userMenuOpen && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1055 }} onClick={() => setUserMenuOpen(false)}></div>
                  )}

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div 
                        className="user-dropdown-menu-glass position-absolute"
                        style={{ top: '100%', right: 0, zIndex: 1060 }}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <div className="px-3 py-2 border-bottom border-secondary mb-1">
                          <small className="text-muted d-block" style={{fontSize: '10px'}}>CONECTADO COMO</small>
                          <strong className="text-white" style={{fontSize: '13px'}}>{usuario?.email || 'usuario@ruki.com'}</strong>
                        </div>
                        
                        <Link to="/mi-perfil" className="py-2 user-dropdown-item text-decoration-none d-flex align-items-center" onClick={() => setUserMenuOpen(false)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2 text-info">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          Mi Perfil
                        </Link>

                        <Link to="/mis-pedidos" className="py-2 user-dropdown-item text-decoration-none d-flex align-items-center" onClick={() => setUserMenuOpen(false)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2 text-warning">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>
                          </svg>
                          Mis Pedidos
                        </Link>
                        
                        <div className="user-divider"></div>
                        
                        <button 
                          onClick={() => { logout(); navigate('/'); setUserMenuOpen(false); }} 
                          className="py-2 text-danger user-dropdown-item bg-transparent border-0 w-100 text-start d-flex align-items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                          Cerrar Sesión
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Nav.Link as={Link} to="/login" className="small p-0 text-white fw-medium">
                  Log in/Join
                </Nav.Link>
              )}
              
              {/* BOTÓN DEL CARRITO */}
              <div className="ios-cart-btn" onClick={handleShow} style={{ color: '#ffffff', transition: 'opacity 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>

                {cartCount > 0 && (
                  <Badge bg="danger" pill className="ios-cart-badge">
                    {cartCount}
                  </Badge>
                )}
              </div>

            </div>
          </Container>
        </Navbar>

        {/* BARRA INFERIOR CLARA */}
        <Navbar className="py-2 ruki-bottom-navbar border-top border-dark">
          <Container fluid className="px-4 px-lg-5">
            <Nav className="mx-auto gap-2 gap-md-4 ruki-scroll-nav">
              <NavLink to="/" className={({ isActive }) => `ruki-nav-link text-decoration-none ${isActive ? 'nav-active' : ''}`}>INICIO</NavLink>
              <NavLink to="/new-arrivals" className={({ isActive }) => `ruki-nav-link text-decoration-none ${isActive ? 'nav-active' : ''}`}>NEW ARRIVALS</NavLink>
              <NavLink to="/productos" className={({ isActive }) => `ruki-nav-link text-decoration-none ${isActive ? 'nav-active' : ''}`}>PRODUCTOS</NavLink>
              <NavLink to="/sale" className={({ isActive }) => `ruki-nav-link text-decoration-none ${isActive ? 'nav-active' : ''}`}>SALE</NavLink>
              <NavLink to="/noticias" className={({ isActive }) => `ruki-nav-link text-decoration-none ${isActive ? 'nav-active' : ''}`}>BLOG</NavLink>
              <NavLink to="/faq" className={({ isActive }) => `ruki-nav-link text-decoration-none ${isActive ? 'nav-active' : ''}`}>FAQ</NavLink>
              <a href="https://www.google.com/maps/search/Crossfit/@-33.4946527,-70.7525297,15z/data=!3m1!4b1?entry=ttu&g_ep=EgoyMDI2MDQyOS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer" className="ruki-nav-link text-decoration-none">UBICACIÓN</a>
            </Nav>
          </Container>
        </Navbar>
      </header>

      {/* PANEL LATERAL DEL CARRITO  */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="ruki-cart-backdrop"
              onClick={handleClose}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 250 }}
              className="ruki-cart-sidebar"
            >
              <div className="ios-offcanvas-header d-flex justify-content-between align-items-center">
                <h5 className="fw-bolder text-dark m-0" style={{ letterSpacing: '-0.02em' }}>
                  Tu Carrito <span className="text-secondary fw-medium">({cartCount})</span>
                </h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={handleClose}></button>
              </div>
              
              <div className="d-flex flex-column flex-grow-1 p-0 bg-white" style={{ overflow: "hidden" }}>
                {cart.length === 0 ? (
                  <div className="text-center mt-5 p-4 text-muted">
                    <div className="ios-empty-cart-icon mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-secondary opacity-50">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
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
                        {cart.map(item => {
                          const maxStock = item.variants?.find(v => v.size === item.selectedSize)?.stock ?? item.stock;
                          return (
                            <motion.div 
                              key={item.uniqueId} 
                              layout
                              initial={{ opacity: 0, x: 50 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                              className="d-flex align-items-center ios-cart-item"
                            >
                              {/* IMAGEN */}
                              <div className="ios-cart-img-wrapper">
                                <img 
                                  src={item.imageUrls && item.imageUrls[0] ? item.imageUrls[0] : 'https://via.placeholder.com/80'} 
                                  alt={item.name} 
                                  className="ios-cart-img" 
                                />
                              </div>
                              
                              {/* DETALLES (Nombre, Talla y Precio Real) */}
                              <div className="flex-grow-1">
                                <h6 className="ios-cart-title fw-bold text-dark mb-0">{item.name}</h6>
                                <small className="text-muted d-block mb-1" style={{fontSize: '0.8rem'}}>Talla: <span className="fw-semibold text-dark">{item.selectedSize}</span></small>
                                
                                <p className="ios-cart-price mb-2 fw-semibold text-primary">
                                  ${(Number(item.precioFinal) || Number(item.cartPrice) || Number(item.basePrice) || 0).toLocaleString('es-CL')}
                                </p>
                                
                                {/* CONTROLES USANDO UNIQUEID */}
                                <div className="d-flex align-items-center">
                                  <button className="ios-btn-icon" onClick={() => updateQuantity(item.uniqueId, item.cantidad - 1)}>-</button>
                                  <span className="ios-cart-qty">{item.cantidad}</span>
                                  <button className="ios-btn-icon" onClick={() => updateQuantity(item.uniqueId, item.cantidad + 1)} disabled={item.cantidad >= maxStock}>+</button>
                                </div>
                              </div>
                              
                              {/* SVG ELIMINAR USANDO UNIQUEID */}
                              <button className="btn btn-link text-danger p-2 ms-2 text-decoration-none" onClick={() => removeFromCart(item.uniqueId)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  <line x1="10" y1="11" x2="10" y2="17"></line>
                                  <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                              </button>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>

                    {/* RESUMEN Y BOTÓN DE PAGO */}
                    <div className="ios-cart-footer">
                      <div className="d-flex justify-content-between mb-3 fw-bolder text-dark fs-5" style={{ letterSpacing: '-0.02em' }}>
                        <span>Total</span>
                        <span>${cartTotalAmount.toLocaleString('es-CL')}</span>
                      </div>
                      <motion.button whileTap={{ scale: 0.95 }} className="ios-btn-dark w-100 py-3" onClick={irAlCheckout}>
                        FINALIZAR COMPRA
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;