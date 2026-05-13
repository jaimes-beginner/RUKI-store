// Importaciones
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import './FooterAdmin.css'; // <-- NUEVO ARCHIVO DE ESTILOS

// Componente para la barra inferior del panel de administración
export function FooterAdmin() {
  const currentYear = new Date().getFullYear(); // Automatizamos el año (2026)

  return (
    <footer className="admin-footer-glass pt-5 pb-4 mt-5">
      <div className="container-fluid px-4">
        <div className="row justify-content-between">

          {/* Información de la tienda */}
          <div className="col-md-5 mb-4">
            <h5 className="admin-footer-title">
              <i className="fas fa-shield-alt me-2 text-danger"></i>
              ZONA ADMIN RUKI
            </h5>
            <p className="admin-footer-text">
              En <strong>RUKI</strong> se forjan atletas, gestionando el éxito desde el estilo.
            </p>
            <p className="admin-footer-text font-italic">
              Gestionando la comunidad de Ruki, un WOD a la vez.
            </p>

            <div className="mt-4 d-flex gap-3">
              <motion.a whileHover={{ y: -3, scale: 1.1 }} href="#" className="admin-social-icon"><i className="fab fa-facebook-f"></i></motion.a>
              <motion.a whileHover={{ y: -3, scale: 1.1 }} href="#" className="admin-social-icon"><i className="fab fa-twitter"></i></motion.a>
              <motion.a whileHover={{ y: -3, scale: 1.1 }} href="#" className="admin-social-icon"><i className="fab fa-instagram"></i></motion.a>
              <motion.a whileHover={{ y: -3, scale: 1.1 }} href="#" className="admin-social-icon"><i className="fab fa-linkedin-in"></i></motion.a>
            </div>
          </div>

          {/* Enlaces rapidos */}
          <div className="col-md-3 mb-4 ms-auto text-md-end">
            <h5 className="admin-footer-title">ENLACES RÁPIDOS</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mt-3">
              <li>
                <Link to="/" className="admin-footer-link">Ver Tienda Pública</Link>
              </li>
              <li>
                <Link to="/inventario-admin" className="admin-footer-link">Gestión de Productos</Link>
              </li>
              <li>
                <Link to="#" className="admin-footer-link disabled-link">Blog (Próximamente)</Link>
              </li>
              <li>
                <Link to="#" className="admin-footer-link disabled-link">Soporte Técnico</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="admin-footer-divider my-4"></div>

        {/* Copyright */}
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="admin-footer-bottom-text mb-0">
              &copy; {currentYear} RUKI. Panel de Administración. Todos los derechos reservados.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end mt-3 mt-md-0 d-flex justify-content-center justify-content-md-end gap-4">
            <Link to="#" className="admin-footer-bottom-link disabled-link">
              Política de Privacidad
            </Link>
            <Link to="#" className="admin-footer-bottom-link disabled-link">
              Términos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}