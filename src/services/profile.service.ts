import apiClient from './apiClient';

export const profileService = {
  get: async (userId: string | number) => { const { data } = await apiClient.get(`/profile/${userId}`); return data; },
  update: async (userId: string | number, payload: any) => { const { data } = await apiClient.put(`/profile/${userId}`, payload); return data; },
  changePassword: async (userId: string | number, currentPassword: string, newPassword: string) => {
    const { data } = await apiClient.post(`/profile/${userId}/change-password`, { currentPassword, newPassword }); return data;
  },
  uploadPhoto: async (userId: string | number, file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    const { data } = await apiClient.post(`/profile/${userId}/photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data;
  },
  getNotificationPreferences: async (userId: string | number) => { const { data } = await apiClient.get(`/profile/${userId}/notifications`); return data; },
  updateNotificationPreferences: async (userId: string | number, preferences: any) => {
    const { data } = await apiClient.put(`/profile/${userId}/notifications`, { preferences }); return data;
  },
  delete: async (userId: string | number) => { await apiClient.delete(`/profile/${userId}`); },
};
