import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, UsersParams } from '@/services/users.service';

export const USERS_KEY = 'users';

export const useUsers = (params?: UsersParams) => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: [USERS_KEY, { ...params, page }],
    queryFn: () => usersService.getAll({ ...params, page }),
  });

  const createMutation = useMutation({
    mutationFn: usersService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) => usersService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  });

  const deleteMutation = useMutation({
    mutationFn: usersService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  });

  const raw = query.data as any;

  return {
    users: raw?.data ?? raw ?? [],
    total: raw?.total ?? 0,
    page,
    totalPages: raw?.pages ?? 1,
    setPage,
    loading: query.isLoading,
    fetchUsers: (p?: UsersParams) => usersService.getAll(p),
    getUserStats: usersService.getStats,
    getUser: usersService.getById,
    createUser: createMutation.mutateAsync,
    updateUser: (id: string | number, data: any) => updateMutation.mutateAsync({ id, data }),
    deleteUser: deleteMutation.mutateAsync,
    resetPassword: usersService.resetPassword,
  };
};
