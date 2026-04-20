import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { contentService } from '@/services/content.service';

export const CONTENT_KEY = 'content';
export const SERVICE_TIMES_KEY = 'service-times';

export const useContent = () => {
  const qc = useQueryClient();

  const contentQuery = useQuery({
    queryKey: [CONTENT_KEY],
    queryFn: contentService.getAll,
  });

  const serviceTimesQuery = useQuery({
    queryKey: [SERVICE_TIMES_KEY],
    queryFn: contentService.getServiceTimes,
  });

  const contentMap: Record<string, string> = useMemo(() => 
    Array.isArray(contentQuery.data)
      ? contentQuery.data.reduce((acc: any, item: any) => { acc[item.key] = item.value; return acc; }, {})
      : {}
  , [contentQuery.data]);

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => contentService.update(key, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CONTENT_KEY] }),
  });

  const createServiceTimeMutation = useMutation({
    mutationFn: contentService.createServiceTime,
    onSuccess: () => qc.invalidateQueries({ queryKey: [SERVICE_TIMES_KEY] }),
  });

  const updateServiceTimeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => contentService.updateServiceTime(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SERVICE_TIMES_KEY] }),
  });

  const deleteServiceTimeMutation = useMutation({
    mutationFn: contentService.deleteServiceTime,
    onSuccess: () => qc.invalidateQueries({ queryKey: [SERVICE_TIMES_KEY] }),
  });

  return {
    contentMap,
    contentLoading: contentQuery.isLoading,
    contentLoaded: contentQuery.isSuccess,
    serviceTimes: Array.isArray(serviceTimesQuery.data) ? serviceTimesQuery.data :
      (serviceTimesQuery.data as any)?.data ?? [],
    serviceTimesLoading: serviceTimesQuery.isLoading,
    getContent: contentService.getAll,
    getContentByKey: contentService.getByKey,
    updateContent: (key: string, value: string) => updateMutation.mutateAsync({ key, value }),
    getServiceTimes: contentService.getServiceTimes,
    createServiceTime: createServiceTimeMutation.mutateAsync,
    updateServiceTime: (id: string, data: any) => updateServiceTimeMutation.mutateAsync({ id, data }),
    deleteServiceTime: deleteServiceTimeMutation.mutateAsync,
  };
};
