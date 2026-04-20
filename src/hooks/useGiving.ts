import { useMutation, useQueryClient } from '@tanstack/react-query';
import { givingService } from '@/services/giving.service';

export const GIVING_KEY = 'giving';

export const useGiving = () => {
  const qc = useQueryClient();

  const createMutation = useMutation({
    mutationFn: givingService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [GIVING_KEY] }),
  });

  return {
    getMemberGiving: givingService.getByMember,
    getMemberGivingSummary: givingService.getSummary,
    createGiving: createMutation.mutateAsync,
  };
};
