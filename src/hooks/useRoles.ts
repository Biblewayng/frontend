import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesService } from '@/services/roles.service';

export const ROLES_KEY = 'roles';

export const useRoles = () => {
  const qc = useQueryClient();

  const query = useQuery({ queryKey: [ROLES_KEY], queryFn: rolesService.getAll });

  const createMutation = useMutation({
    mutationFn: (data: any) => rolesService.update(data.name, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ROLES_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => rolesService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ROLES_KEY] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (_id: string) => Promise.resolve(), // roles are not deleted, only permissions updated
    onSuccess: () => qc.invalidateQueries({ queryKey: [ROLES_KEY] }),
  });

  return {
    roles: query.data ?? [],
    loading: query.isLoading,
    getRoles: rolesService.getAll,
    getRole: rolesService.getAll,
    createRole: createMutation.mutateAsync,
    updateRole: (id: string, data: any) => updateMutation.mutateAsync({ id, data }),
    deleteRole: deleteMutation.mutateAsync,
    getPermissions: rolesService.getPermissions,
    getRolePermissions: rolesService.getRolePermissions,
  };
};
