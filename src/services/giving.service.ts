import apiClient from './apiClient';

export const givingService = {
  getAll: async (page = 1, limit = 20) => { const { data } = await apiClient.get('/giving', { params: { page, limit } }); return data; },
  getByMember: async (memberId: string | number, year?: number, page = 1, limit = 10) => { const { data } = await apiClient.get(`/giving/member/${memberId}`, { params: { ...(year ? { year } : {}), page, limit } }); return data; },
  getSummary: async (memberId: string | number, year?: number) => { const { data } = await apiClient.get(`/giving/member/${memberId}/summary`, { params: year ? { year } : {} }); return data; },
  create: async (payload: any) => { const { data } = await apiClient.post('/giving', payload); return data; },
};
