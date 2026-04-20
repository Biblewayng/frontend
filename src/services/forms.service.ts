import apiClient from './apiClient';

export const formsService = {
  getAll: async (params?: any) => { const { data } = await apiClient.get('/forms', { params }); return data; },
  getById: async (id: string) => { const { data } = await apiClient.get(`/forms/${id}`); return data; },
  create: async (payload: any) => { const { data } = await apiClient.post('/forms', payload); return data; },
  update: async (id: string, payload: any) => { const { data } = await apiClient.put(`/forms/${id}`, payload); return data; },
  delete: async (id: string) => { await apiClient.delete(`/forms/${id}`); },
  deleteMultiple: async (ids: string[]) => { await apiClient.post('/forms/delete-multiple', ids); },
  submitResponse: async (id: string, payload: any) => { const { data } = await apiClient.post(`/forms/${id}/responses`, payload); return data; },
  getResponses: async (id: string, params?: any) => { const { data } = await apiClient.get(`/forms/${id}/responses`, { params }); return data; },
  exportResponses: async (id: string): Promise<Blob> => { const { data } = await apiClient.get(`/forms/${id}/responses/export`, { responseType: 'blob' }); return data; },
};
