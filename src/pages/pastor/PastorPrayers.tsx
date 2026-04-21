import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { prayersService } from '@/services/prayers.service';
import { formatDate } from '@/utils/date';
import Pagination from '@/components/common/Pagination';

export default function PastorPrayers() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['pastor-prayers', page],
    queryFn: () => prayersService.getAll({ page, limit: 15, include_private: true }),
  });

  const prayers = (data as any)?.data ?? [];
  const totalPages = (data as any)?.pages ?? 1;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Prayer Requests</h3>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : prayers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="ri-heart-line text-4xl mb-2"></i>
          <p>No prayer requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prayers.map((prayer: any) => (
            <div key={prayer.id} onClick={() => setSelected(prayer)}
              className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{prayer.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {prayer.member_name || 'Anonymous'} · {formatDate(prayer.date || prayer.created_at)}
                  </p>
                </div>
                <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  prayer.is_private ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  <i className={`${prayer.is_private ? 'ri-lock-line' : 'ri-global-line'} mr-1`}></i>
                  {prayer.is_private ? 'Private' : 'Public'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{selected.title}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <p className="text-gray-700 mb-4">{selected.description || 'No description provided'}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-gray-500">Member</p><p className="font-medium">{selected.member_name || 'Anonymous'}</p></div>
              <div><p className="text-gray-500">Date</p><p className="font-medium">{formatDate(selected.date || selected.created_at)}</p></div>
              <div><p className="text-gray-500">Privacy</p><p className="font-medium">{selected.is_private ? 'Private' : 'Public'}</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
