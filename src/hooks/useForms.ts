import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formsService } from '@/services/forms.service';

export const FORMS_KEY = 'forms';

export const useForms = (params?: any) => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: [FORMS_KEY, { ...params, page }],
    queryFn: () => formsService.getAll({ ...params, page }),
  });

  const createMutation = useMutation({
    mutationFn: formsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [FORMS_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => formsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FORMS_KEY] }),
  });

  const deleteMutation = useMutation({
    mutationFn: formsService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: [FORMS_KEY] }),
  });

  const raw = query.data as any;

  return {
    forms: raw?.data ?? raw ?? [],
    total: raw?.total ?? 0,
    page,
    totalPages: raw?.pages ?? 1,
    setPage,
    loading: query.isLoading,
    getForms: formsService.getAll,
    getForm: formsService.getById,
    createForm: createMutation.mutateAsync,
    updateForm: (id: string, data: any) => updateMutation.mutateAsync({ id, data }),
    deleteForm: deleteMutation.mutateAsync,
    deleteForms: formsService.deleteMultiple,
    submitFormResponse: formsService.submitResponse,
    getFormResponses: formsService.getResponses,
    exportFormResponses: formsService.exportResponses,
  };
};
