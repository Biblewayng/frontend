import apiClient from './apiClient';

export const announcementsService = {
  getAll: async (params?: any) => { const { data } = await apiClient.get('/announcements', { params }); return data; },
  getById: async (id: string) => { const { data } = await apiClient.get(`/announcements/${id}`); return data; },
  create: async (payload: any) => { const { data } = await apiClient.post('/announcements', payload); return data; },
  update: async (id: string, payload: any) => { const { data } = await apiClient.put(`/announcements/${id}`, payload); return data; },
  delete: async (id: string) => { await apiClient.delete(`/announcements/${id}`); },
  incrementViews: async (id: string) => { await apiClient.post(`/announcements/${id}/view`); },
};
