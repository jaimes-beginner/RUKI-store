import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function PublicRoute({ children }) {
    const { isAuthenticated, usuario } = useAuth();

    if (isAuthenticated) {
        const isAdmin = usuario?.role === "ADMIN" || usuario?.role === "ROLE_ADMIN";

        // SI EL ADMIN VA A SU PANEL, Y SI EL CLIENTE VA A LA TIENDA
        return <Navigate to={isAdmin ? "/admin/dashboard" : "/"} replace />;
    }

    return children;
}
