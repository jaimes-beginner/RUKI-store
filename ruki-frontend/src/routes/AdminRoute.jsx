import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminRoute({ children }) {
    const { isAuthenticated, usuario } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const isAdmin = usuario?.role === "ADMIN" || usuario?.role === "ROLE_ADMIN";
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}