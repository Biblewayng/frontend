import apiClient from './apiClient';

export const authService = {
  getAuthStatus: async () => { const { data } = await apiClient.get('/auth/status'); return data; },
  login: async (email: string, password: string) => { const { data } = await apiClient.post('/auth/login', { email, password }); return data; },
  register: async (first_name: string, last_name: string, email: string, password: string, phone?: string) => {
    const { data } = await apiClient.post('/auth/register', { first_name, last_name, email, password, phone }); return data;
  },
  verify: async () => { const { data } = await apiClient.get('/auth/verify'); return data; },
  getMe: async () => { const { data } = await apiClient.get('/auth/me'); return data; },
  getMyPermissions: async () => { const { data } = await apiClient.get('/permissions/me'); return data; },
  refresh: async (refresh_token: string) => { const { data } = await apiClient.post('/auth/refresh', { refresh_token }); return data; },
  logoutAll: async (userId: string) => { await apiClient.post(`/auth/logout-all/${userId}`); },
  requestVerification: async () => { const { data } = await apiClient.post('/auth/email-verification/request'); return data; },
  verifyEmail: async (code: string) => { const { data } = await apiClient.post('/auth/email-verification/verify', { code }); return data; },
  forgotPassword: async (email: string) => { const { data } = await apiClient.post('/auth/forgot-password', { email }); return data; },
  resetPassword: async (token: string, new_password: string) => { const { data } = await apiClient.post('/auth/reset-password', { token, new_password }); return data; },
};
