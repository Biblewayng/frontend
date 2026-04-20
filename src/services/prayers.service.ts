import apiClient from './apiClient';

export const prayersService = {
  getAll: async (params?: any) => { const { data } = await apiClient.get('/prayers', { params }); return data; },
  getByMember: async (memberId: string | number, page = 1, limit = 10) => { const { data } = await apiClient.get(`/prayers/member/${memberId}`, { params: { page, limit } }); return data; },
  getById: async (id: string) => { const { data } = await apiClient.get(`/prayers/${id}`); return data; },
  create: async (payload: any) => { const { data } = await apiClient.post('/prayers', payload); return data; },
  update: async (id: string, payload: any) => { const { data } = await apiClient.put(`/prayers/${id}`, payload); return data; },
  delete: async (id: string) => { await apiClient.delete(`/prayers/${id}`); },
  pray: async (id: string) => { await apiClient.post(`/prayers/${id}/pray`); },
};
