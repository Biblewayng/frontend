import apiClient from './apiClient';

export const dashboardService = {
  getStats: async () => { const { data } = await apiClient.get('/dashboard/stats'); return data; },
  getActivity: async () => { const { data } = await apiClient.get('/dashboard/activity'); return data; },
  getMemberStats: async (memberId: string) => { const { data } = await apiClient.get(`/dashboard/member/${memberId}/stats`); return data; },
  getMemberRecentSermons: async (memberId: string) => { const { data } = await apiClient.get(`/dashboard/member/${memberId}/recent-sermons`); return data; },
  getMemberUpcomingEvents: async (memberId: string) => { const { data } = await apiClient.get(`/dashboard/member/${memberId}/upcoming-events`); return data; },
};
