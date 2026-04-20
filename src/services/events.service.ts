import apiClient from './apiClient';

export interface EventsParams { page?: number; limit?: number; upcoming?: boolean; }

export const eventsService = {
  getAll: async (params?: EventsParams) => { const { data } = await apiClient.get('/events', { params }); return data; },
  getById: async (id: string | number) => { const { data } = await apiClient.get(`/events/${id}`); return data; },
  getMemberEvents: async (memberId: string | number, page = 1, limit = 10) => { const { data } = await apiClient.get(`/events/member/${memberId}`, { params: { page, limit } }); return data; },
  create: async (payload: any) => { const { data } = await apiClient.post('/events', payload); return data; },
  update: async (id: string | number, payload: any) => { const { data } = await apiClient.put(`/events/${id}`, payload); return data; },
  delete: async (id: string | number) => { await apiClient.delete(`/events/${id}`); },
  register: async (id: string | number, memberId: string | number) => { const { data } = await apiClient.post(`/events/${id}/register`, { member_id: memberId }); return data; },
  unregister: async (id: string | number, memberId: string | number) => { await apiClient.delete(`/events/${id}/register/${memberId}`); },
  getAttendees: async (id: string | number) => { const { data } = await apiClient.get(`/events/${id}/attendees`); return data; },
  markAttendance: async (id: string | number, memberId: string | number) => { await apiClient.put(`/events/${id}/attendance/${memberId}`, {}); },
};
