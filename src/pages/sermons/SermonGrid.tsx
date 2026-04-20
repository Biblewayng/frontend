import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useSermons } from '@/hooks/useSermons';
import { useSermonPlayer } from '@/hooks/useSermonPlayer';
import { Sermon } from '@/types';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import { getMediaUrl } from '@/services/api';
import { downloadSermon } from '@/utils/media';
import AudioPlayer from '@/components/AudioPlayer';
import EditSermonModal from './EditSermonModal';
import LazyImage from '@/components/LazyImage';
import DataTable from '@/components/common/DataTable';
import Pagination from '@/components/common/Pagination';
import { type ColumnDef } from '@tanstack/react-table';

interface SermonGridProps {
  searchTerm: string;
  viewMode: 'grid' | 'list';
}

export default function SermonGrid({ searchTerm, viewMode }: SermonGridProps) {
  const { sermons, loading, deleteSermon, page, totalPages, setPage } = useSermons({ search: searchTerm || undefined });
  const { incrementDownloadCount, incrementPlayCount } = useSermonPlayer();
  const [playingSermon, setPlayingSermon] = useState<Sermon | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sermonToDelete, setSermonToDelete] = useState<{ id: string | number; title: string } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sermonToEdit, setSermonToEdit] = useState<Sermon | null>(null);

  const handleDelete = async () => {
    if (!sermonToDelete) return;
    try {
      await deleteSermon(sermonToDelete.id);
      setShowDeleteConfirm(false);
      setSermonToDelete(null);
    } catch {}
  };

  const togglePlay = (sermon: Sermon) => {
    if (playingSermon?.id === sermon.id) {
      setPlayingSermon(null);
    } else {
      setPlayingSermon(sermon);
      incrementPlayCount(sermon.id);
    }
  };

  const downloadSermonFile = async (sermon: Sermon) => {
    try {
      if (!sermon.audio_url) {
        toast.error('No audio file is available for this sermon');
        return;
      }
      await incrementDownloadCount(sermon.id);
      await downloadSermon(sermon.audio_url, sermon.title);
    } catch { toast.error('Failed to download sermon'); }
  };

  const actions = (sermon: Sermon) => (
    <div className="flex items-center gap-1">
      <button onClick={() => togglePlay(sermon)}
        className={`p-2 rounded-full cursor-pointer transition-colors ${playingSermon?.id === sermon.id ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
        <i className={`${playingSermon?.id === sermon.id ? 'ri-pause-fill' : 'ri-play-fill'} text-lg`}></i>
      </button>
      <button onClick={() => downloadSermonFile(sermon)} className="p-2 text-gray-400 hover:text-blue-600 cursor-pointer">
        <i className="ri-download-line text-lg"></i>
      </button>
      <button onClick={() => { setSermonToEdit(sermon); setShowEditModal(true); }} className="p-2 text-gray-400 hover:text-green-600 cursor-pointer">
        <i className="ri-edit-line text-lg"></i>
      </button>
      <button onClick={() => { setSermonToDelete({ id: sermon.id, title: sermon.title }); setShowDeleteConfirm(true); }} className="p-2 text-gray-400 hover:text-red-600 cursor-pointer">
        <i className="ri-delete-bin-line text-lg"></i>
      </button>
    </div>
  );

  const columns = useMemo<ColumnDef<Sermon, any>[]>(() => [
    {
      id: 'title',
      header: 'Sermon',
      accessorKey: 'title',
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex items-center space-x-3">
            {s.thumbnail_url ? (
              <LazyImage className="w-10 h-10 rounded object-cover" src={getMediaUrl(s.thumbnail_url) || ''} alt={s.title} />
            ) : (
              <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {s.title.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{s.title}</p>
              <p className="text-xs text-gray-500">{s.speaker}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: 'series',
      header: 'Series',
      accessorKey: 'series_name',
      cell: ({ getValue }) => getValue() ? (
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{getValue()}</span>
      ) : <span className="text-gray-400 text-xs">—</span>,
    },
    {
      id: 'date',
      header: 'Date',
      accessorKey: 'date',
      cell: ({ getValue }) => new Date(getValue<string>().split('T')[0] + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', timeZone: 'UTC' }),
    },
    {
      id: 'duration',
      header: 'Duration',
      accessorKey: 'duration',
    },
    {
      id: 'plays',
      header: 'Plays',
      accessorKey: 'plays',
      cell: ({ getValue }) => (
        <span className="flex items-center gap-1 text-gray-500"><i className="ri-play-line"></i>{getValue<number>() || 0}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => actions(row.original),
    },
  ], [playingSermon]);

  const renderCard = (sermon: Sermon) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
      <div className="relative w-full" style={{ paddingBottom: '56%' }}>
        {sermon.thumbnail_url ? (
          <LazyImage className="absolute inset-0 w-full h-full object-cover" src={getMediaUrl(sermon.thumbnail_url) || ''} alt={sermon.title} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl">
            {sermon.title.charAt(0).toUpperCase()}
          </div>
        )}
        <button onClick={() => togglePlay(sermon)}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
            <i className={`${playingSermon?.id === sermon.id ? 'ri-pause-fill' : 'ri-play-fill'} text-gray-900 text-xl ml-0.5`}></i>
          </div>
        </button>
        {sermon.series_name && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full font-medium">
            {sermon.series_name}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-900 truncate">{sermon.title}</p>
        <p className="text-xs text-gray-500 truncate mt-0.5">{sermon.speaker}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <i className="ri-headphone-line"></i>{sermon.plays ?? 0}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => downloadSermonFile(sermon)} className="p-1 text-gray-400 hover:text-blue-600 cursor-pointer">
              <i className="ri-download-line text-sm"></i>
            </button>
            <button onClick={() => { setSermonToEdit(sermon); setShowEditModal(true); }} className="p-1 text-gray-400 hover:text-green-600 cursor-pointer">
              <i className="ri-edit-line text-sm"></i>
            </button>
            <button onClick={() => { setSermonToDelete({ id: sermon.id, title: sermon.title }); setShowDeleteConfirm(true); }} className="p-1 text-gray-400 hover:text-red-600 cursor-pointer">
              <i className="ri-delete-bin-line text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <AudioPlayer sermon={playingSermon} onClose={() => setPlayingSermon(null)} />
      {sermonToEdit && (
        <EditSermonModal isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setSermonToEdit(null); }}
          onSuccess={() => { setShowEditModal(false); setSermonToEdit(null); }} sermon={sermonToEdit} />
      )}
      <div className="px-6 py-2 text-sm text-gray-500">{sermons.length} sermons</div>
      <DataTable
        data={sermons}
        columns={columns}
        viewMode={viewMode === 'list' ? 'table' : 'grid'}
        renderCard={renderCard}
        isLoading={loading}
        globalFilter={searchTerm}
        emptyMessage="No sermons found."
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <ConfirmDialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete} title="Delete Sermon"
        message={`Are you sure you want to delete "${sermonToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete" type="danger" />
    </>
  );
}
