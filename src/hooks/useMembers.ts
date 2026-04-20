import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersService, MembersParams } from '@/services/members.service';

export const MEMBERS_KEY = 'members';

export const useMembers = (params?: MembersParams) => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: [MEMBERS_KEY, { ...params, page }],
    queryFn: () => membersService.getAll({ ...params, page }),
  });

  const createMutation = useMutation({
    mutationFn: membersService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [MEMBERS_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => membersService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [MEMBERS_KEY] }),
  });

  const deleteMutation = useMutation({
    mutationFn: membersService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: [MEMBERS_KEY] }),
  });

  const raw = query.data as any;

  return {
    members: raw?.data ?? [],
    total: raw?.total ?? 0,
    page,
    totalPages: raw?.pages ?? 1,
    setPage,
    loading: query.isLoading,
    getMembers: (p?: MembersParams) => membersService.getAll(p),
    getMember: membersService.getById,
    createMember: createMutation.mutateAsync,
    updateMember: (id: string, data: any) => updateMutation.mutateAsync({ id, data }),
    deleteMember: deleteMutation.mutateAsync,
    exportMembers: membersService.export,
  };
};
