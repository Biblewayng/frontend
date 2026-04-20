import apiClient from './apiClient';

export const settingsService = {
  getAll: async (category?: string) => { const { data } = await apiClient.get('/settings', { params: category ? { category } : {} }); return data; },
  getByKey: async (key: string) => { const { data } = await apiClient.get(`/settings/${key}`); return data; },
  update: async (key: string, value: string, category?: string) => { const { data } = await apiClient.put(`/settings/${key}`, { value, category }); return data; },
  bulkUpdate: async (settings: Record<string, any>) => { const { data } = await apiClient.post('/settings/bulk', settings); return data; },
  getSystemStatus: async () => { const { data } = await apiClient.get('/settings/system/status'); return data; },
  getSecurityStats: async () => { const { data } = await apiClient.get('/settings/security/stats'); return data; },
  testEmail: async (recipient?: string, provider?: 'resend' | 'smtp') => { const { data } = await apiClient.post('/settings/notifications/test-email', { recipient, provider }); return data; },
  getIntegrationStats: async () => { const { data } = await apiClient.get('/settings/integrations/stats'); return data; },
  testIntegration: async (integration: string) => { const { data } = await apiClient.post(`/settings/integrations/${integration}/test`); return data; },
};
