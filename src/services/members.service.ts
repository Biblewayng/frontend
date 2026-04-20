import apiClient from './apiClient';

export interface MembersParams { search?: string; role?: string; page?: number; limit?: number; }

const transform = (m: any) => ({ ...m, membershipStatus: m.membership_status, dateJoined: m.date_joined, maritalStatus: m.marital_status });

export const membersService = {
  getAll: async (params?: MembersParams) => {
    const { data } = await apiClient.get('/members', { params });
    if (Array.isArray(data)) return { data: data.map(transform), total: data.length };
    return { ...data, data: (data.data || []).map(transform) };
  },
  getById: async (id: string) => { const { data } = await apiClient.get(`/members/${id}`); return transform(data); },
  create: async (payload: any) => { const { data } = await apiClient.post('/members', payload); return data; },
  update: async (id: string, payload: any) => { const { data } = await apiClient.put(`/members/${id}`, payload); return transform(data); },
  delete: async (id: string) => { await apiClient.delete(`/members/${id}`); },
  export: async (format: 'csv' | 'pdf', params?: any): Promise<Blob> => {
    const { data } = await apiClient.get('/members/export', { params: { format, ...params }, responseType: 'blob' });
    return data;
  },
};
