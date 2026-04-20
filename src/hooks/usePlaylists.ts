import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playlistsService } from '@/services/playlists.service';

export const PLAYLISTS_KEY = 'playlists';

export const usePlaylists = (memberId?: string) => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: [PLAYLISTS_KEY, memberId, page],
    queryFn: () => playlistsService.getAll(memberId),
  });

  const createMutation = useMutation({
    mutationFn: playlistsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [PLAYLISTS_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) => playlistsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PLAYLISTS_KEY] }),
  });

  const deleteMutation = useMutation({
    mutationFn: playlistsService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: [PLAYLISTS_KEY] }),
  });

  const raw = query.data as any;
  const playlists = Array.isArray(raw) ? raw : raw?.data ?? [];
  const totalPages = raw?.pages ?? 1;

  return {
    playlists,
    total: raw?.total ?? playlists.length,
    page,
    totalPages,
    setPage,
    loading: query.isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    fetchPlaylists: (id?: string) => qc.invalidateQueries({ queryKey: [PLAYLISTS_KEY, id] }),
    getPlaylist: playlistsService.getById,
    createPlaylist: createMutation.mutateAsync,
    updatePlaylist: (id: string | number, data: any) => updateMutation.mutateAsync({ id, data }),
    deletePlaylist: deleteMutation.mutateAsync,
    addSermonToPlaylist: playlistsService.addSermon,
    removeSermonFromPlaylist: playlistsService.removeSermon,
    incrementPlays: playlistsService.incrementPlays,
  };
};
