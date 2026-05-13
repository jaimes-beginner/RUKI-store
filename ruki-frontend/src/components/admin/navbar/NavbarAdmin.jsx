import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { motion } from 'framer-motion';
import './NavbarAdmin.css'; // <-- NUESTRO NUEVO ARCHIVO DE ESTILOS

export function NavbarAdmin() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth(); 
    
    const navLinks = [
        { path: "/inventario-admin", label: "Gestión de productos" },
        { path: "/usuarios-admin", label: "Gestión de usuarios" },
        { path: "/pedidos-admin", label: "Gestión de pedidos"}
    ];

    function handleLogout(e) {
        e.preventDefault();
        if (globalThis.confirm("¿Estás seguro de cerrar sesión?")) {
            logout();
            navigate("/login");
        }
    }

    return (
        /* Le quitamos el bg-dark de Bootstrap y ponemos nuestra clase glass */
        <header className="admin-header-glass">
            <nav className="navbar navbar-expand-lg navbar-dark container">
                
                {/* Logo con efecto de resorte al hacer clic */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link className="navbar-brand d-flex align-items-center" to="/admin/reporte-dashboard">
                        <img src="/imagenes/logo.png" alt="Logo RUKI" height="40" className="me-2" />
                        <span className="badge bg-danger ms-2 rounded-pill">ADMIN</span>
                    </Link>
                </motion.div>

                <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#menucollapse">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="menucollapse">
                    <ul className="navbar-nav ms-auto align-items-lg-center gap-2">
                        {navLinks.map((link) => (
                            <motion.li 
                                className="nav-item" 
                                key={link.path}
                                whileHover={{ y: -2 }} // Se levanta sutilmente 2 pixeles
                                whileTap={{ scale: 0.95 }} // Se contrae al presionar
                            >
                                <Link
                                    to={link.path}
                                    className={`nav-link ruki-nav-link ${location.pathname === link.path ? "active" : ""}`}
                                >
                                    {link.label}
                                </Link>
                            </motion.li>
                        ))}

                        {/* Botón de logout con animación suave */}
                        <motion.li 
                            className="nav-item ms-lg-3 mt-2 mt-lg-0"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <button
                                className="btn ruki-btn-logout px-4 py-2 rounded-pill"
                                onClick={handleLogout}
                            >
                                Salir
                            </button>
                        </motion.li>
                    </ul>
                </div>
            </nav>
        </header>
    );
}