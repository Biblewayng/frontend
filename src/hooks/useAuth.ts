import { authService } from '@/services/auth.service';

export const useAuth = () => ({
  login: authService.login,
  register: authService.register,
  verifyToken: authService.verify,
  getMe: authService.getMe,
  refreshToken: authService.refresh,
  logoutAll: authService.logoutAll,
});
