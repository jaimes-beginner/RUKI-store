import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; 

export function AdminRoute({ children }) {
    const { usuario, isAuthenticated } = useAuth();

    /*
        En caso de que el usuario no esté 
        logeado, entonces lo mandamos al login
    */
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    /*
        Si el usuario está logueado pero no es 
        administrador, entonces lo mandamos a la página principal
    */
    if (usuario?.role !== "ADMIN" && usuario?.role !== "ROLE_ADMIN") {
        return <Navigate to="/" replace />;
    }

    /*
        Si el usuario es administrador, entonces 
        mostramos su pantalla correspondiente  
    */
    return children;
}