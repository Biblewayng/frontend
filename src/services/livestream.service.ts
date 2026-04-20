import apiClient from './apiClient';

export const livestreamService = {
  getCurrent: async () => { const { data } = await apiClient.get('/livestreams/current'); return data; },
  getHistory: async (page = 1, limit = 5) => { const { data } = await apiClient.get('/livestreams/history', { params: { page, limit } }); return data; },
  create: async (payload: any) => { const { data } = await apiClient.post('/livestreams', payload); return data; },
  update: async (id: string, payload: any) => { const { data } = await apiClient.put(`/livestreams/${id}`, payload); return data; },
  end: async (id: string) => { await apiClient.post(`/livestreams/${id}/end`); },
  getChat: async (id: string, limit?: number) => { const { data } = await apiClient.get(`/livestreams/${id}/chat`, { params: limit ? { limit } : {} }); return data; },
  deleteChat: async (id: string, messageId: string) => { await apiClient.delete(`/livestreams/${id}/chat/${messageId}`); },
  getViewers: async (id: string) => { const { data } = await apiClient.get(`/livestreams/${id}/viewers`); return data; },
  addViewer: async (id: string, payload: any) => { const { data } = await apiClient.post(`/livestreams/${id}/viewers`, payload); return data; },
  removeViewer: async (id: string, viewerId: number) => { await apiClient.delete(`/livestreams/${id}/viewers/${viewerId}`); },
  banViewer: async (id: string, viewerId: number) => { await apiClient.post(`/livestreams/${id}/viewers/${viewerId}/ban`); },
  unbanViewer: async (id: string, viewerId: number) => { await apiClient.post(`/livestreams/${id}/viewers/${viewerId}/unban`); },
  getStats: async (id: string) => { const { data } = await apiClient.get(`/livestreams/${id}/stats`); return data; },
  bulkViewerAction: async (id: string, viewerIds: number[], action: 'disconnect' | 'ban', note?: string) => {
    await apiClient.post(`/livestreams/${id}/viewers/bulk-action`, { viewer_ids: viewerIds, action, note });
  },
  getStreamUrl: async () => { const { data } = await apiClient.get('/livestreams/icecast/butt-config'); return data.stream_url as string; },
  getPublicCurrent: async () => { const { data } = await apiClient.get('/livestreams/public/current'); return data; },
  getPublicStatus: async () => { const { data } = await apiClient.get('/livestreams/public/status'); return data; },
};
