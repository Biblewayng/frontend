import apiClient from './apiClient';

export const pushService = {
  getVapidPublicKey: async () => {
    const { data } = await apiClient.get('/push/vapid-public-key');
    return data.publicKey;
  },
  subscribe: async (subscription: any) => {
    const { data } = await apiClient.post('/push/subscribe', subscription);
    return data;
  },
  unsubscribe: async (endpoint: string) => {
    const { data } = await apiClient.post('/push/unsubscribe', { endpoint });
    return data;
  }
};
