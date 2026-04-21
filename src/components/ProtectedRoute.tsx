import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/context/PermissionContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
}

export const ProtectedRoute = ({ children, requiredPermission, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { hasPermission, loading: permLoading } = usePermissions();

  if (loading || permLoading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'member' ? '/member-dashboard' : user.role === 'pastor' ? '/pastor/dashboard' : '/admin/dashboard'} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to={user.role === 'member' ? '/member-dashboard' : user.role === 'pastor' ? '/pastor/dashboard' : '/admin/dashboard'} replace />;
  }

  return <>{children}</>;
};
