import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsService, EventsParams } from '@/services/events.service';

export const EVENTS_KEY = 'events';

export const useEvents = (params?: EventsParams) => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: [EVENTS_KEY, { ...params, page }],
    queryFn: () => eventsService.getAll({ ...params, page }),
  });

  const createMutation = useMutation({
    mutationFn: eventsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [EVENTS_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) => eventsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EVENTS_KEY] }),
  });

  const deleteMutation = useMutation({
    mutationFn: eventsService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: [EVENTS_KEY] }),
  });

  const raw = query.data as any;

  return {
    events: raw?.data ?? raw ?? [],
    total: raw?.total ?? 0,
    page,
    totalPages: raw?.pages ?? 1,
    setPage,
    loading: query.isLoading,
    getEvents: eventsService.getAll,
    getEvent: eventsService.getById,
    getMemberEvents: eventsService.getMemberEvents,
    createEvent: createMutation.mutateAsync,
    updateEvent: (id: string | number, data: any) => updateMutation.mutateAsync({ id, data }),
    deleteEvent: deleteMutation.mutateAsync,
    registerForEvent: eventsService.register,
    unregisterFromEvent: eventsService.unregister,
    getEventAttendees: eventsService.getAttendees,
    markAttendance: eventsService.markAttendance,
  };
};
