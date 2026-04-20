import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sermonsService, SermonsParams } from '@/services/sermons.service';

export const SERMONS_KEY = 'sermons';

export const useSermons = (params?: SermonsParams) => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: [SERMONS_KEY, { ...params, page }],
    queryFn: () => sermonsService.getAll({ ...params, page }),
  });

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => sermonsService.create(formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SERMONS_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) => sermonsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SERMONS_KEY] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => sermonsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SERMONS_KEY] }),
  });

  const raw = query.data as any;

  return {
    sermons: raw?.data ?? [],
    total: raw?.total ?? 0,
    page,
    totalPages: raw?.pages ?? 1,
    setPage,
    loading: query.isLoading,
    error: query.error,
    fetchSermons: (p?: SermonsParams) => qc.invalidateQueries({ queryKey: [SERMONS_KEY, p] }),
    createSermon: createMutation.mutateAsync,
    updateSermon: (id: string | number, data: any) => updateMutation.mutateAsync({ id, data }),
    deleteSermon: deleteMutation.mutateAsync,
    getSermon: sermonsService.getById,
    incrementPlays: sermonsService.incrementPlays,
    incrementDownloads: sermonsService.incrementDownloads,
  };
};
