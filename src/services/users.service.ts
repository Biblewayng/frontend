import apiClient from './apiClient';

export interface UsersParams { search?: string; role?: string; status?: string; page?: number; limit?: number; }

export const usersService = {
  getAll: async (params?: UsersParams) => { const { data } = await apiClient.get('/users', { params }); return data; },
  getById: async (id: string | number) => { const { data } = await apiClient.get(`/users/${id}`); return data; },
  getStats: async () => { const { data } = await apiClient.get('/users/stats'); return data; },
  create: async (payload: any) => { const { data } = await apiClient.post('/users', payload); return data; },
  update: async (id: string | number, payload: any) => { const { data } = await apiClient.put(`/users/${id}`, payload); return data; },
  delete: async (id: string | number) => { await apiClient.delete(`/users/${id}`); },
  resetPassword: async (id: string | number, newPassword: string) => {
    const { data } = await apiClient.post(`/users/${id}/reset-password`, { newPassword });
    return data;
  },
};
