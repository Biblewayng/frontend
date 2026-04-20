import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prayersService } from '@/services/prayers.service';

export const PRAYERS_KEY = 'prayers';

export const usePrayers = (params?: any) => {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [PRAYERS_KEY, params],
    queryFn: () => prayersService.getAll(params),
  });

  const createMutation = useMutation({
    mutationFn: prayersService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRAYERS_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => prayersService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRAYERS_KEY] }),
  });

  const deleteMutation = useMutation({
    mutationFn: prayersService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRAYERS_KEY] }),
  });

  return {
    prayers: (query.data as any)?.data ?? query.data ?? [],
    loading: query.isLoading,
    getPrayerRequests: prayersService.getAll,
    getMemberPrayerRequests: prayersService.getByMember,
    getPrayerRequest: prayersService.getById,
    createPrayerRequest: createMutation.mutateAsync,
    updatePrayerRequest: (id: string, data: any) => updateMutation.mutateAsync({ id, data }),
    deletePrayerRequest: deleteMutation.mutateAsync,
    prayForRequest: prayersService.pray,
  };
};
