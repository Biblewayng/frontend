import apiClient from './apiClient';
import type { ScheduleEntry, ScheduleCreate } from '@/types/pastor_schedule';

export type { ScheduleEntry, ScheduleCreate };

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
