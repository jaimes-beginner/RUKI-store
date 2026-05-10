import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function PublicRoute({ children }) {
    const { isAuthenticated, usuario } = useAuth();

    /*
        En caso de que el usuario ya esté 
        logeadok, no lo dejaremos ver esta página
    */
    if (isAuthenticated) {

        /*
            Leemos su rol para saber a donde mandarlo
        */
        const rol = usuario?.role || usuario?.rol;
        const roleName = typeof rol === 'object' ? rol?.name : String(rol);
        const isAdmin = roleName === "1" || roleName === "ADMIN" || roleName === "ROLE_ADMIN";

        /*
            Usamos "replace" para que no quede rastro 
            en el botón de retroceso
        */
        if (isAdmin) {
            return <Navigate to="/admin/reporte-dashboard" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    /*
        Si no está logueado, entonces le permitimos ver el formulario de login correspondiente
    */
    return children;
}