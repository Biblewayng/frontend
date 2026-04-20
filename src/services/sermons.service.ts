import apiClient from './apiClient';
import { Sermon, SermonSeries } from '@/types';

export interface SermonsParams {
  page?: number;
  limit?: number;
  search?: string;
  series_id?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const sermonsService = {
  getAll: async (params?: SermonsParams): Promise<PaginatedResponse<Sermon>> => {
    const { data } = await apiClient.get('/sermons', { params });
    return data;
  },

  getById: async (id: string): Promise<Sermon> => {
    const { data } = await apiClient.get(`/sermons/${id}`);
    return data;
  },

  create: async (formData: FormData): Promise<Sermon> => {
    const { data } = await apiClient.post('/sermons', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  update: async (id: string | number, payload: any): Promise<Sermon> => {
    const isFormData = payload instanceof FormData;
    const { data } = await apiClient.put(`/sermons/${id}`, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return data;
  },

  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/sermons/${id}`);
  },

  incrementPlays: async (id: string | number): Promise<void> => {
    await apiClient.post(`/sermons/${id}/play`);
  },

  incrementDownloads: async (id: string | number): Promise<void> => {
    await apiClient.post(`/sermons/${id}/download`);
  },
};

export const seriesService = {
  getAll: async (): Promise<SermonSeries[]> => {
    const { data } = await apiClient.get('/series');
    return Array.isArray(data) ? data : data.data || [];
  },

  create: async (payload: { name: string; description?: string }): Promise<SermonSeries> => {
    const { data } = await apiClient.post('/series', payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/series/${id}`);
  },
};
