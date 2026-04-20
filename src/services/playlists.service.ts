import apiClient from './apiClient';

export const playlistsService = {
  getAll: async (memberId?: string) => { const { data } = await apiClient.get('/playlists', { params: memberId ? { member_id: memberId } : {} }); return data; },
  getById: async (id: string | number) => { const { data } = await apiClient.get(`/playlists/${id}`); return data; },
  create: async (payload: any) => { const { data } = await apiClient.post('/playlists', payload); return data; },
  update: async (id: string | number, payload: any) => { const { data } = await apiClient.put(`/playlists/${id}`, payload); return data; },
  delete: async (id: string | number) => { await apiClient.delete(`/playlists/${id}`); },
  addSermon: async (id: string | number, sermonId: string | number) => { await apiClient.post(`/playlists/${id}/sermons`, { sermon_id: sermonId }); },
  removeSermon: async (id: string | number, sermonId: string | number) => { await apiClient.delete(`/playlists/${id}/sermons/${sermonId}`); },
  incrementPlays: async (id: string | number) => { await apiClient.post(`/playlists/${id}/play`); },
};
