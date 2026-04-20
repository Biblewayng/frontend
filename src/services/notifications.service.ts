import apiClient from './apiClient';

export const notificationsService = {
  getAll: async (page = 1, limit = 20) => {
    const { data } = await apiClient.get('/notifications', { params: { page, limit } });
    return data;
  },
  getUnreadCount: async () => {
    const { data } = await apiClient.get('/notifications/unread-count');
    return data;
  },
  markAsRead: async (notificationId: string) => {
    const { data } = await apiClient.put(`/notifications/${notificationId}/read`);
    return data;
  },
  markAllAsRead: async () => {
    const { data } = await apiClient.put('/notifications/read-all');
    return data;
  },
};
