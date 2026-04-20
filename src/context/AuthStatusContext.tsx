import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth.service';

interface AuthStatusContextType {
  authStatus: { signup_enabled: boolean; login_enabled: boolean } | null;
  loading: boolean;
  refreshAuthStatus: () => Promise<void>;
}

const AuthStatusContext = createContext<AuthStatusContextType | undefined>(undefined);

export const AuthStatusProvider = ({ children }: { children: ReactNode }) => {
  const [authStatus, setAuthStatus] = useState<{ signup_enabled: boolean; login_enabled: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAuthStatus = async () => {
    try {
      const data = await authService.getAuthStatus();
      setAuthStatus(data);
    } catch {
      setAuthStatus({ signup_enabled: true, login_enabled: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthStatus();
  }, []);

  return (
    <AuthStatusContext.Provider value={{ authStatus, loading, refreshAuthStatus: fetchAuthStatus }}>
      {children}
    </AuthStatusContext.Provider>
  );
};

export const useAuthStatus = () => {
  const context = useContext(AuthStatusContext);
  if (!context) throw new Error('useAuthStatus must be used within AuthStatusProvider');
  return context;
};