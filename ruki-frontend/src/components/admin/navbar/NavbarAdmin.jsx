// Importaciones
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

/*-------------------------------------------------*/

// Componente que renderiza la barra de navegación para el administrador.
export function NavbarAdmin() {

    const location = useLocation();
    const navigate = useNavigate();
    
    // Usamos el contexto real
    const { usuario, logout } = useAuth();
    
    const navLinks = [
        { path: "/inventario-admin", label: "Gestión de productos" },
        { path: "/usuarios-admin", label: "Gestión de usuarios" },
        { path: "/pedidos-admin", label: "Gestión de pedidos"}
    ];

    // Función para manejar el cierre de sesión
    function handleLogout(e) {
        e.preventDefault();
        if (globalThis.confirm("¿Estás seguro de cerrar sesión?")) {
            logout();               // Llama al logout del contexto (borra el token)
            navigate("/login");     // Redirige al login unificado
        }
    }

    return (
        <header>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    {/* Logo */}
                    <Link className="navbar-brand d-flex align-items-center" to="/admin/reporte-dashboard">
                        <img src="/imagenes/logo.png" alt="Logo RUKI" height="40" className="me-2" />
                        <span className="badge bg-danger ms-2">ADMIN</span>
                    </Link>

                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menucollapse">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="menucollapse">
                        <ul className="navbar-nav ms-auto align-items-lg-center">
                            {navLinks.map((link) => (
                                <li className="nav-item" key={link.path}>
                                    <Link
                                        to={link.path}
                                        className={`nav-link${location.pathname === link.path ? " active fw-bold text-light" : ""}`}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}

                            {/* Botón de logout */}
                            <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
                                <div className="d-flex align-items-center gap-3">
                                    {/* Mostrar nombre del admin */}
                                    <span className="text-white small">
                                        {usuario?.nombreUsuario}
                                    </span>
                                    <button
                                        className="btn btn-outline-light btn-sm px-3 py-1"
                                        onClick={handleLogout}
                                    >
                                        Salir
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}