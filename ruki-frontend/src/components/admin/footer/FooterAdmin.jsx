// Importaciones
import { Link } from "react-router-dom";

/*-------------------------------------------------*/

// Componente para la barra inferior del panel de administración
export function FooterAdmin() {

  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-5">
      <div className="container fluid">
        <div className="row justify-content-between">

          {/* Información de la ropa de la tienda */}
          <div className="col-md-4 mb-4">
            <h5 className="text-uppercase mb-4"><strong>Zona Admin</strong></h5>
            <p>
              En <strong>RUKI</strong> se forjan atletas, gestionando el éxito desde el estilo.
            </p>
            <p>
              <strong>
                Gestionando la comunidad de Ruki, un WOD a la vez.
              </strong>
            </p>

            <div className="mt-3">
              <Link to="#" className="text-white me-2"><i className="fab fa-facebook-f"></i></Link>
              <Link to="#" className="text-white me-2"><i className="fab fa-twitter"></i></Link>
              <Link to="#" className="text-white me-2"><i className="fab fa-instagram"></i></Link>
              <Link to="#" className="text-white"><i className="fab fa-linkedin-in"></i></Link>
            </div>
          </div>

          {/* Enlaces rapidos */}
          <div className="col-md-2 mb-4 ms-auto">
            <h5 className="text-uppercase mb-4 text-end">Enlaces</h5>
            <ul className="list-unstyled text-end enlaces-footer-grande">
              <li className="mb-2">
                <Link to="/" className="text-white text-decoration-none">Inicio</Link>
              </li>
              <li className="mb-2">
                <Link to="/inventario" className="text-white text-decoration-none">Productos</Link>
              </li>
              <li className="mb-2">
                <Link to="#" className="text-white text-decoration-none disabled-link">Blog</Link>
              </li>
              <li className="mb-2">
                <Link to="#" className="text-white text-decoration-none disabled-link">Contacto</Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-4" />

        {/* Copyright */}
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="mb-0">&copy; 2025 RUKI. Panel de Administración. Todos los derechos reservados.</p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <Link to="#" className="text-white text-decoration-none me-3 disabled-link">
              Política de Privacidad
            </Link>
            <Link to="#" className="text-white text-decoration-none disabled-link">
              Términos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
  
}
