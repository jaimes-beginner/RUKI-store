import React, { useState } from 'react';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext'; 
import './AdminNavbar.css';

export default function AdminNavbar() {
    const { logout, usuario } = useAuth();
    const navigate = useNavigate();
    const [adminMenuOpen, setAdminMenuOpen] = useState(false);

    const handleLogout = () => {
        if (window.confirm("¿Estás seguro de cerrar sesión en la consola de administrador?")) {
            logout();
            navigate("/login");
        }
    };

    return (
        <header className="admin-header-wrapper">
            {/* BARRA SUPERIOR OSCURA SÓLIDA */}
            <Navbar variant="dark" className="py-3 py-md-4 admin-top-navbar">
                <Container fluid className="admin-topbar d-flex justify-content-between align-items-center px-3 px-lg-5">
                    
                    <div className="admin-topbar-side d-flex flex-column justify-content-center">
                        {/* Ocultamos el texto en celular, pero mantenemos el div para hacer espacio */}
                        <div className="d-none d-md-flex align-items-center gap-2 mb-1">
                            <span className="server-status-dot pulse"></span>
                            <span className="server-status-text">SISTEMAS OPERATIVOS</span>
                        </div>
                    </div>
                    
                    <Navbar.Brand as={Link} to="/admin/dashboard" className="admin-brand-centered m-0">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="d-flex align-items-center">
                            <img src="/imagenes/logo.png" alt="RUKI logo" className="admin-logo" />
                            <Badge bg="danger" className="ms-2 admin-badge-pill shadow-sm d-none d-sm-block">ADMIN</Badge>
                        </motion.div>
                    </Navbar.Brand>
                    
                    <div className="admin-topbar-side d-flex justify-content-end align-items-center gap-3">
                        <div className="position-relative">
                            <button 
                                className="admin-dropdown-toggle bg-transparent text-decoration-none p-0 border-0 d-flex align-items-center gap-2"
                                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                            >
                                <div className="admin-avatar-mini">
                                    {usuario?.firstName ? usuario.firstName.charAt(0).toUpperCase() : 'A'}
                                </div>
                                <span className="d-none d-md-inline text-white small fw-bold">
                                    {usuario?.firstName || 'Administrador'}
                                </span>
                                <motion.div animate={{ rotate: adminMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="d-none d-md-block">
                                  <i className="fas fa-chevron-down text-secondary" style={{fontSize: '12px'}}></i>
                                </motion.div>
                            </button>

                            {adminMenuOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 1055 }} onClick={() => setAdminMenuOpen(false)}></div>}

                            <AnimatePresence>
                                {adminMenuOpen && (
                                    <motion.div 
                                        className="admin-dropdown-menu-glass position-absolute"
                                        style={{ top: '100%', right: 0, zIndex: 1060 }}
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                    >
                                        <div className="px-3 py-2 border-bottom border-secondary mb-1">
                                            <small className="text-secondary d-block" style={{fontSize: '10px'}}>CONECTADO COMO</small>
                                            <strong className="text-white" style={{fontSize: '13px'}}>{usuario?.email || 'admin@ruki.com'}</strong>
                                        </div>
                                        <Link to="/" className="py-2 admin-dropdown-item text-decoration-none d-flex align-items-center" onClick={() => setAdminMenuOpen(false)}>
                                            <i className="fas fa-store me-2 text-info"></i> Ver Tienda Pública
                                        </Link>
                                        <div className="admin-divider"></div>
                                        <button onClick={() => { handleLogout(); setAdminMenuOpen(false); }} className="py-2 text-danger admin-dropdown-item bg-transparent border-0 w-100 text-start d-flex align-items-center">
                                            <i className="fas fa-sign-out-alt me-2"></i> Cerrar sesión
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </Container>
            </Navbar>

            {/* BARRA INFERIOR SÓLIDA (DESLIZABLE EN CELULAR) */}
            <Navbar className="py-2 admin-bottom-navbar">
                <Container fluid className="px-0 px-lg-5">
                    <Nav className="mx-auto d-flex flex-row flex-nowrap overflow-auto gap-3 gap-md-4 px-3 px-md-0 ruki-scroll-nav hide-scrollbar">
                        <NavLink to="/admin/dashboard" className={({ isActive }) => `admin-nav-link text-decoration-none text-nowrap ${isActive ? 'nav-active' : ''}`}>
                            <i className="fas fa-chart-pie me-2 d-none d-md-inline"></i>DASHBOARD
                        </NavLink>
                        <NavLink to="/admin/inventario" className={({ isActive }) => `admin-nav-link text-decoration-none text-nowrap ${isActive ? 'nav-active' : ''}`}>
                            <i className="fas fa-box-open me-2 d-none d-md-inline"></i>PRODUCTOS
                        </NavLink>
                        <NavLink to="/admin/usuarios" className={({ isActive }) => `admin-nav-link text-decoration-none text-nowrap ${isActive ? 'nav-active' : ''}`}>
                            <i className="fas fa-users me-2 d-none d-md-inline"></i>USUARIOS
                        </NavLink>
                        <NavLink to="/admin/pedidos" className={({ isActive }) => `admin-nav-link text-decoration-none text-nowrap ${isActive ? 'nav-active' : ''}`}>
                            <i className="fas fa-truck-fast me-2 d-none d-md-inline"></i>LOGÍSTICA
                        </NavLink>
                        <NavLink to="/admin/pos" className={({ isActive }) => `admin-nav-link text-decoration-none text-nowrap ${isActive ? 'nav-active' : ''}`}>
                            <i className="fas fa-cash-register me-2 d-none d-md-inline"></i>POS / TIENDA
                        </NavLink>
                    </Nav>
                </Container>
            </Navbar>
        </header>
    );
}