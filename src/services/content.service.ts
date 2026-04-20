import apiClient from './apiClient';

export const contentService = {
  getAll: async () => { const { data } = await apiClient.get('/content'); return data; },
  getByKey: async (key: string) => { const { data } = await apiClient.get(`/content/${key}`); return data; },
  update: async (key: string, value: string) => { const { data } = await apiClient.put(`/content/${key}`, { value }); return data; },
  getServiceTimes: async () => { const { data } = await apiClient.get('/content/service-times'); return data; },
  createServiceTime: async (payload: any) => { const { data } = await apiClient.post('/content/service-times', payload); return data; },
  updateServiceTime: async (id: string, payload: any) => { const { data } = await apiClient.put(`/content/service-times/${id}`, payload); return data; },
  deleteServiceTime: async (id: string | number) => { await apiClient.delete(`/content/service-times/${id}`); },
};
