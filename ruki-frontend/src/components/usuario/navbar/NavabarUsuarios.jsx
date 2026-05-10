// src/components/Header.jsx
import { useState } from 'react';
import { Navbar, Nav, Container, Offcanvas, Badge, Dropdown } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
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
      {/* ESTILOS IOS GLOBALES PARA EL CARRITO Y DROPDOWN */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .ios-dropdown-menu {
            border: 1.5px solid #e5e5ea !important;
            border-radius: 16px !important;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06) !important;
            padding: 8px !important;
            font-family: 'Inter', sans-serif;
        }
        .ios-dropdown-item {
            border-radius: 8px;
            transition: all 0.2s;
            font-weight: 500;
        }
        .ios-dropdown-item:hover {
            background-color: #f5f5f7 !important;
        }
        
        .ios-offcanvas {
            font-family: 'Inter', sans-serif !important;
            border-left: 1.5px solid #e5e5ea !important;
        }
        .ios-offcanvas-header {
            border-bottom: 1.5px solid #e5e5ea;
            padding: 20px;
        }
        
        .ios-cart-item {
            border-bottom: 1.5px solid #e5e5ea;
            padding: 16px 20px;
        }
        .ios-cart-item:last-child {
            border-bottom: none;
        }
        
        .ios-btn-dark { 
            background: #1d1d1f; 
            color: #ffffff; 
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            border-radius: 12px;
            padding: 14px;
            border: none;
            transition: all 0.2s;
        }
        .ios-btn-dark:hover { background: #000000; }
        
        .ios-btn-outline { 
            background: #ffffff; 
            color: #1d1d1f; 
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            border-radius: 10px;
            padding: 10px;
            border: 1.5px solid #d2d2d7;
            transition: all 0.2s;
        }
        .ios-btn-outline:hover { background: #f5f5f7; }

        .ios-btn-icon {
            background: #fbfbfd;
            color: #1d1d1f;
            border: 1.5px solid #d2d2d7;
            border-radius: 8px;
            width: 28px;
            height: 28px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            transition: all 0.2s;
            cursor: pointer;
            padding: 0;
        }
        .ios-btn-icon:hover:not(:disabled) {
            background: #1d1d1f;
            color: #ffffff;
            border-color: #1d1d1f;
        }
        .ios-btn-icon:disabled {
            background: #e5e5ea;
            color: #86868b;
            border-color: #e5e5ea;
            cursor: not-allowed;
        }
      `}</style>

      <header className="ruki-header">
        {/* Parte superior: Logo y links de acceso */}
        <Navbar bg="dark" variant="dark" className="py-3 ruki-top-navbar" style={{ fontFamily: "'Inter', sans-serif" }}>
          <Container fluid className="ruki-topbar d-flex justify-content-between align-items-center px-4 px-lg-5">
            <div className="ruki-topbar-side"></div> 
            
            <Navbar.Brand as={Link} to="/" className="ruki-brand-centered">
              <img src="/imagenes/logo.png" alt="RUKI logo" className="ruki-logo" />
            </Navbar.Brand>
            
            <div className="ruki-topbar-side d-flex justify-content-end align-items-center gap-3">
              {/* LÓGICA DE SESIÓN VISUAL */}
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
                      <i className="fas fa-user-circle me-2" style={{ color: '#86868b' }}></i> Mi Perfil
                    </Dropdown.Item>
                    
                    <Dropdown.Divider style={{ borderColor: '#e5e5ea', margin: '4px 0' }} />
                    
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
                <Nav.Link as={Link} to="/login" className="small p-0 text-white fw-medium">Log in/Join</Nav.Link>
              )}
              
              {/* BOTÓN DEL CARRITO INTELIGENTE */}
              <div style={{ cursor: 'pointer', position: 'relative', padding: '4px' }} onClick={handleShow}>
                <span className="cart-icon fs-5">🛒</span>
                {cartCount > 0 && (
                  <Badge bg="danger" pill style={{ position: 'absolute', top: '-4px', right: '-8px', fontSize: '0.65rem', border: '2px solid #212529' }}>
                    {cartCount}
                  </Badge>
                )}
              </div>

            </div>
          </Container>
        </Navbar>

        {/* Parte inferior: Navegación principal */}
        <Navbar bg="secondary" variant="dark" className="py-2 border-top border-dark ruki-bottom-navbar" style={{ fontFamily: "'Inter', sans-serif" }}>
          <Container fluid className="px-4 px-lg-5">
            <Nav className="mx-auto gap-5">
              <NavLink to="/new-arrivals" className={({ isActive }) => `nav-link fw-bold small ${isActive ? 'nav-active' : ''}`}>NEW ARRIVALS</NavLink>
              <NavLink to="/productos" className={({ isActive }) => `nav-link fw-bold small ${isActive ? 'nav-active' : ''}`}>PRODUCTOS</NavLink>
              <NavLink to="/sale" className={({ isActive }) => `nav-link fw-bold small ${isActive ? 'nav-active' : ''}`}>SALE</NavLink>
            </Nav>
          </Container>
        </Navbar>
      </header>

      {/* PANEL LATERAL DEL CARRITO  */}
      <Offcanvas show={showCart} onHide={handleClose} placement="end" className="ios-offcanvas">
        <Offcanvas.Header closeButton className="ios-offcanvas-header">
          <Offcanvas.Title className="fw-bolder text-dark" style={{ letterSpacing: '-0.02em' }}>
            Tu Carrito <span style={{ color: '#86868b', fontWeight: '500' }}>({cartCount})</span>
          </Offcanvas.Title>
        </Offcanvas.Header>
        
        <Offcanvas.Body className="d-flex flex-column p-0 bg-white">
          {cart.length === 0 ? (
            <div className="text-center mt-5 p-4 text-muted">
              <div className="mb-3 d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', borderRadius: '40px', background: '#f5f5f7' }}>
                <i className="fas fa-shopping-bag fa-2x" style={{ color: '#d2d2d7' }}></i>
              </div>
              <h5 className="fw-bolder text-dark mb-2">Tu carrito está vacío</h5>
              <p className="small mb-4" style={{ color: '#86868b' }}>Aún no has agregado ningún producto.</p>
              <button className="ios-btn-outline w-100" onClick={handleClose}>
                SEGUIR COMPRANDO
              </button>
            </div>
          ) : (
            <>
              {/* LISTA DE PRODUCTOS */}
              <div className="flex-grow-1" style={{ overflowY: 'auto' }}>
                {cart.map(item => (
                  <div key={item.id} className="d-flex align-items-center ios-cart-item">
                    {/* Imagen del producto */}
                    <div style={{ padding: '4px', border: '1.5px solid #e5e5ea', borderRadius: '12px', marginRight: '16px' }}>
                      <img 
                        src={item.imageUrls && item.imageUrls[0] ? item.imageUrls[0] : 'https://via.placeholder.com/80'} 
                        alt={item.name} 
                        style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px' }} 
                      />
                    </div>
                    
                    {/* Detalles */}
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: '13px', letterSpacing: '-0.01em' }}>{item.name}</h6>
                      <p className="mb-2 fw-semibold" style={{ fontSize: '12px', color: '#86868b' }}>
                        ${Number(item.basePrice).toLocaleString('es-CL')}
                      </p>
                      
                      {/* Controles de Cantidad */}
                      <div className="d-flex align-items-center">
                        <button className="ios-btn-icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span className="mx-3 fw-bold text-dark" style={{ fontSize: '12px', width: '12px', textAlign: 'center' }}>{item.quantity}</span>
                        <button className="ios-btn-icon" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}>+</button>
                      </div>
                    </div>
                    
                    {/* Botón Eliminar */}
                    <button className="btn btn-link text-danger p-2 ms-2 text-decoration-none" onClick={() => removeFromCart(item.id)}>
                      <i className="fas fa-trash-alt" style={{ fontSize: '14px' }}></i>
                    </button>
                  </div>
                ))}
              </div>

              {/* RESUMEN Y BOTÓN DE PAGO */}
              <div className="p-4" style={{ background: '#fbfbfd', borderTop: '1.5px solid #e5e5ea' }}>
                <div className="d-flex justify-content-between mb-3 fw-bolder text-dark" style={{ fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
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