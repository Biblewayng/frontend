import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seriesService } from '@/services/sermons.service';

export const SERIES_KEY = 'series';

export const useSeries = () => {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [SERIES_KEY],
    queryFn: seriesService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: seriesService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [SERIES_KEY] }),
  });

  const deleteMutation = useMutation({
    mutationFn: seriesService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: [SERIES_KEY] }),
  });

  return {
    series: query.data ?? [],
    loading: query.isLoading,
    getSeries: () => query.data ?? [],
    createSeries: createMutation.mutateAsync,
    deleteSeries: deleteMutation.mutateAsync,
  };
};
