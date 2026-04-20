import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { type ColumnDef } from '@tanstack/react-table';
import { prayersService } from '@/services/prayers.service';
import DataTable from '@/components/common/DataTable';
import Pagination from '@/components/common/Pagination';

export default function PrayersList() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedPrayer, setSelectedPrayer] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-prayers', page],
    queryFn: () => prayersService.getAll({ page, limit: 20, include_private: true }),
  });

  const prayers = (data as any)?.data ?? data ?? [];
  const totalPages = (data as any)?.pages ?? 1;

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prayer request?')) return;
    try {
      await prayersService.delete(id);
      toast.success('Prayer request deleted');
      qc.invalidateQueries({ queryKey: ['admin-prayers'] });
    } catch {
      toast.error('Failed to delete prayer request');
    }
  };

  const columns: ColumnDef<any, any>[] = [
    {
      header: 'Title',
      accessorKey: 'title',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.original.title}</div>
      ),
    },
    {
      header: 'Member',
      accessorKey: 'member_name',
      cell: ({ getValue }) => getValue() || 'Anonymous',
    },
    {
      header: 'Date',
      accessorKey: 'created_at',
      cell: ({ row }) => new Date(row.original.date || row.original.created_at).toLocaleDateString(),
    },
    {
      header: 'Privacy',
      accessorKey: 'is_private',
      cell: ({ getValue }) => getValue() ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <i className="ri-lock-line mr-1"></i>Private
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <i className="ri-global-line mr-1"></i>Public
        </span>
      ),
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-4 justify-end">
          <button onClick={() => setSelectedPrayer(row.original)} className="text-blue-600 hover:text-blue-900">View</button>
          <button onClick={() => handleDelete(row.original.id)} className="text-red-600 hover:text-red-900">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <DataTable
          data={prayers}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No prayer requests found"
        />
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {selectedPrayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPrayer(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{selectedPrayer.title}</h3>
              <button onClick={() => setSelectedPrayer(null)} className="text-gray-400 hover:text-gray-600">
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-700">{selectedPrayer.description || 'No description provided'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Member</p>
                  <p className="text-gray-900">{selectedPrayer.member_name || selectedPrayer.author || 'Anonymous'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-gray-900">{new Date(selectedPrayer.date || selectedPrayer.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Privacy</p>
                  <p className="text-gray-900">{selectedPrayer.is_private ? 'Private' : 'Public'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
