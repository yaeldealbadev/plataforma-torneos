import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  // Si se indica, restringe el acceso a un rol concreto (p. ej. 'admin').
  requireRole?: 'user' | 'admin';
}

// Placeholder: protege rutas que requieren autenticación (y opcionalmente un rol).
export default function ProtectedRoute({ requireRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user?.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
