import apiClient from './apiClient';

export const contactService = {
  submit: async (data: { name: string; phone?: string; email?: string; message: string }) => {
    const { data: res } = await apiClient.post('/contact', data);
    return res;
  },
  list: async (page = 1, limit = 20) => {
    const { data } = await apiClient.get('/contact', { params: { page, limit } });
    return data;
  },
  reply: async (id: string, reply: string) => {
    const { data } = await apiClient.post(`/contact/${id}/reply`, { reply });
    return data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/contact/${id}`);
  },
};
