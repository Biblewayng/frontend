import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/context/PermissionContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export const ProtectedRoute = ({ children, requiredPermission }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { hasPermission, loading: permLoading } = usePermissions();

  if (loading || permLoading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to={user.role === 'member' ? '/member-dashboard' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};
