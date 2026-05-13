import { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Dropdown, Badge } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './NavbarAdmin.css';

export function NavbarAdmin() {
    const { logout, usuario } = useAuth();
    const navigate = useNavigate();
    const [fecha, setFecha] = useState("");
    const [adminMenuOpen, setAdminMenuOpen] = useState(false);

    /*
        Generar un reloj / fecha en tiempo 
        real para rellenar la barra
    */
    useEffect(() => {
        const actualizarFecha = () => {
            const hoy = new Date();
            const opciones = { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' };
            setFecha(hoy.toLocaleDateString('es-CL', opciones).replace(",", " -"));
        };
        actualizarFecha();

        /*
            Actualiza cada minuto
        */
        const intervalo = setInterval(actualizarFecha, 60000); 
        return () => clearInterval(intervalo);
    }, []);

    const handleLogout = () => {
        if (window.confirm("¿Estás seguro de cerrar sesión en la consola de administrador?")) {
            logout();
            navigate("/login");
        }
    };

    return (
        <header className="admin-header-wrapper">

            {/* BARRA SUPERIOR */}
            <Navbar variant="dark" className="py-4 admin-top-navbar">
                <Container fluid className="admin-topbar d-flex justify-content-between align-items-center px-4 px-lg-5">
                    
                    {/* IZQUIERDA CON LA INFORMACIÓN DEL SISTEMA */}
                    <div className="admin-topbar-side d-none d-lg-flex flex-column justify-content-center">
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="server-status-dot pulse"></span>
                            <span className="server-status-text">SISTEMAS OPERATIVOS</span>
                        </div>
                        <div className="server-date-text text-muted">
                            <i className="far fa-clock me-1"></i> {fecha}
                        </div>
                    </div> 
                    
                    {/* CENTRO CON EL LOGO Y BADGE DE ADMIN */}
                    <Navbar.Brand as={Link} to="/admin/reporte-dashboard" className="admin-brand-centered">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="d-flex align-items-center">
                            <img src="/imagenes/logo.png" alt="RUKI logo" className="admin-logo" />
                            <Badge bg="danger" className="ms-2 admin-badge-pill shadow-sm">ADMIN</Badge>
                        </motion.div>
                    </Navbar.Brand>
                    
                    {/* MENÚ ADMIN  */}
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
                                <motion.div animate={{ rotate: adminMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#86868b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                  </svg>
                                </motion.div>
                            </button>

                            {/* BACKDROP INVISIBLE */}
                            {adminMenuOpen && (
                                <div style={{ position: 'fixed', inset: 0, zIndex: 1055 }} onClick={() => setAdminMenuOpen(false)}></div>
                            )}

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
                                            <small className="text-muted d-block" style={{fontSize: '10px'}}>CONECTADO COMO</small>
                                            <strong className="text-white" style={{fontSize: '13px'}}>{usuario?.email || 'admin@ruki.com'}</strong>
                                        </div>
                                        
                                        <Link to="/" className="py-2 admin-dropdown-item text-decoration-none d-flex align-items-center" onClick={() => setAdminMenuOpen(false)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2 text-info">
                                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>
                                            </svg>
                                            Ver Tienda Pública
                                        </Link>

                                        <div className="admin-divider"></div>
                                        
                                        <button 
                                            onClick={() => { handleLogout(); setAdminMenuOpen(false); }} 
                                            className="py-2 text-danger admin-dropdown-item bg-transparent border-0 w-100 text-start d-flex align-items-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
                                            </svg>
                                            Cerrar sesión
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                </Container>
            </Navbar>

            {/* BARRA INFERIOR DE NAVEGACIÓN */}
            <Navbar className="py-2 admin-bottom-navbar">
                <Container fluid className="px-4 px-lg-5">
                    <Nav className="mx-auto gap-2 gap-md-4 gap-lg-5">
                        <NavLink to="/admin/reporte-dashboard" className={({ isActive }) => `admin-nav-link text-decoration-none ${isActive ? 'nav-active' : ''}`}>
                            <i className="fas fa-chart-pie me-2 d-none d-md-inline"></i>DASHBOARD
                        </NavLink>
                        <NavLink to="/inventario-admin" className={({ isActive }) => `admin-nav-link text-decoration-none ${isActive ? 'nav-active' : ''}`}>
                            <i className="fas fa-box-open me-2 d-none d-md-inline"></i>PRODUCTOS
                        </NavLink>
                        <NavLink to="/usuarios-admin" className={({ isActive }) => `admin-nav-link text-decoration-none ${isActive ? 'nav-active' : ''}`}>
                            <i className="fas fa-users me-2 d-none d-md-inline"></i>USUARIOS
                        </NavLink>
                        <NavLink to="/pedidos-admin" className={({ isActive }) => `admin-nav-link text-decoration-none ${isActive ? 'nav-active' : ''}`}>
                            <i className="fas fa-truck-fast me-2 d-none d-md-inline"></i>LOGÍSTICA
                        </NavLink>
                    </Nav>
                </Container>
            </Navbar>
        </header>
    );
}