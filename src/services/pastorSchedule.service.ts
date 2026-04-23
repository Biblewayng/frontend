import apiClient from './apiClient';

export interface ScheduleEntry {
  id: string;
  pastor_id: string;
  title: string;
  description?: string;
  type: 'meeting' | 'counselling' | 'prep' | 'personal';
  start_datetime: string;
  end_datetime: string;
  created_at: string;
}

export interface ScheduleCreate {
  title: string;
  description?: string;
  type?: string;
  start_datetime: string;
  end_datetime: string;
}

export const pastorScheduleService = {
  getAll: async (month?: number, year?: number): Promise<ScheduleEntry[]> => {
    const { data } = await apiClient.get('/pastor/schedule', { params: { month, year } });
    return data;
  },
  create: async (payload: ScheduleCreate): Promise<ScheduleEntry> => {
    const { data } = await apiClient.post('/pastor/schedule', payload);
    return data;
  },
  update: async (id: string, payload: Partial<ScheduleCreate>): Promise<ScheduleEntry> => {
    const { data } = await apiClient.put(`/pastor/schedule/${id}`, payload);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/pastor/schedule/${id}`);
  },
};
