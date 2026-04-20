import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { authService } from '@/services/auth.service';

interface PermissionContextType {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  loading: boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (user) {
        try {
          const data = await authService.getMyPermissions();
          setPermissions(data.permissions || []);
        } catch (error) {
          console.error('Failed to fetch permissions:', error);
          setPermissions([]);
        }
      } else {
        setPermissions([]);
      }
      setLoading(false);
    };

    if (!authLoading) {
      fetchPermissions();
    }
  }, [user, authLoading]);

  const hasPermission = (permission: string) => {
    if (user?.role === 'superadmin') return true;
    return permissions.includes(permission);
  };

  return (
    <PermissionContext.Provider value={{ permissions, hasPermission, loading: authLoading || loading }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) throw new Error('usePermissions must be used within PermissionProvider');
  return context;
};
