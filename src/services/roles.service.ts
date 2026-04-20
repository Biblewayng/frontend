import apiClient from './apiClient';

export const rolesService = {
  getAll: async () => { const { data } = await apiClient.get('/roles'); return data; },
  update: async (role: string, payload: any) => { const { data } = await apiClient.put(`/roles/${role}`, payload); return data; },
  getPermissions: async () => { const { data } = await apiClient.get('/permissions'); return data; },
  getRolePermissions: async (role: string) => { const { data } = await apiClient.get(`/permissions/role/${role}`); return data; },
};
