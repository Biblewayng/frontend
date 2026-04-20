import { useState } from 'react';
import { formatDate } from '@/utils/date';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { sermonsService } from '@/services/sermons.service';
import { downloadSermon } from '@/utils/media';
import Pagination from '@/components/common/Pagination';

interface Props {
  currentSermon: any;
  onPlaySermon: (sermon: any) => void;
}

export default function MemberSermons({ currentSermon, onPlaySermon }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['member-sermons', searchTerm, page],
    queryFn: () => sermonsService.getAll({ limit: 12, search: searchTerm || undefined, page }),
  });

  const sermons = data?.data ?? [];
  const totalPages = (data as any)?.pages ?? 1;

  const handleDownload = async (sermon: any) => {
    try {
      await sermonsService.incrementDownloads(sermon.id);
      await downloadSermon(sermon.audio_url, sermon.title);
    } catch (e) { console.error('Download error:', e); toast.error('Failed to download sermon'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Sermon Library</h3>
        <div className="relative">
          <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            placeholder="Search sermons..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <i className="ri-search-line absolute left-3 top-2.5 text-gray-400 text-sm"></i>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading sermons...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {sermons.length > 0 ? sermons.map((sermon: any) => (
            <div key={sermon.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">{sermon.title}</h4>
                {sermon.series_name && (
                  <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full font-medium mb-2">
                    {sermon.series_name}
                  </span>
                )}
                <p className="text-sm text-gray-600 mb-1">by {sermon.speaker}</p>
                <p className="text-sm text-gray-500">{formatDate(sermon.date)} • {sermon.duration}</p>
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button onClick={() => onPlaySermon(currentSermon?.id === sermon.id ? null : sermon)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm cursor-pointer whitespace-nowrap">
                  <i className={`${currentSermon?.id === sermon.id ? 'ri-pause-line' : 'ri-play-line'} mr-2`}></i>
                  {currentSermon?.id === sermon.id ? 'Pause' : 'Play'}
                </button>
                <button onClick={() => handleDownload(sermon)}
                  className="text-gray-600 hover:text-gray-800 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer">
                  <i className="ri-download-line"></i>
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-2 text-center py-12">
              <i className="ri-search-line text-4xl text-gray-300 mb-2"></i>
              <p className="text-gray-500">{searchTerm ? `No sermons found matching "${searchTerm}"` : 'No sermons available'}</p>
            </div>
          )}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
