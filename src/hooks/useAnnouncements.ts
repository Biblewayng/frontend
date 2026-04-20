import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementsService } from '@/services/announcements.service';

export const ANNOUNCEMENTS_KEY = 'announcements';

export const useAnnouncements = (params?: any) => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: [ANNOUNCEMENTS_KEY, { ...params, page }],
    queryFn: () => announcementsService.getAll({ ...params, page }),
  });

  const createMutation = useMutation({
    mutationFn: announcementsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [ANNOUNCEMENTS_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => announcementsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ANNOUNCEMENTS_KEY] }),
  });

  const deleteMutation = useMutation({
    mutationFn: announcementsService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: [ANNOUNCEMENTS_KEY] }),
  });

  const raw = query.data as any;

  return {
    announcements: raw?.data ?? raw ?? [],
    total: raw?.total ?? 0,
    page,
    totalPages: raw?.pages ?? 1,
    setPage,
    loading: query.isLoading,
    getAnnouncements: announcementsService.getAll,
    getAnnouncement: announcementsService.getById,
    createAnnouncement: createMutation.mutateAsync,
    updateAnnouncement: (id: string, data: any) => updateMutation.mutateAsync({ id, data }),
    deleteAnnouncement: deleteMutation.mutateAsync,
    incrementViews: announcementsService.incrementViews,
  };
};
