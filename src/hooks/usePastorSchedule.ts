import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pastorScheduleService, ScheduleCreate } from '@/services/pastorSchedule.service';

const KEY = 'pastor-schedule';

export function usePastorSchedule(month?: number, year?: number) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: [KEY] });

  const { data: entries = [], isLoading } = useQuery({
    queryKey: [KEY, month, year],
    queryFn: () => pastorScheduleService.getAll(month, year),
  });

  const createMutation = useMutation({
    mutationFn: (data: ScheduleCreate) => pastorScheduleService.create(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ScheduleCreate> }) =>
      pastorScheduleService.update(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pastorScheduleService.delete(id),
    onSuccess: invalidate,
  });

  return {
    entries,
    isLoading,
    createEntry: createMutation.mutateAsync,
    updateEntry: (id: string, data: Partial<ScheduleCreate>) => updateMutation.mutateAsync({ id, data }),
    deleteEntry: deleteMutation.mutateAsync,
  };
}
