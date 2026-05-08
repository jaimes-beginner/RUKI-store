import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AdminRoute({ children }) {
    const { usuario, token } = useAuth();

    /*
        Si no hay ningún token, entonces vamos al login
    */
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    /*
        Extraemos el rol
    */
    const roleName = typeof usuario?.role === 'object' ? usuario?.role?.name : usuario?.role;
    const isAdmin = roleName === "ROLE_ADMIN" || roleName === "ADMIN";

    /*
        Si no es administrador, entonces lo redireccionamos 
        a la página principal publica
    */
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}