import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import DataTable from '@/components/common/DataTable';
import Pagination from '@/components/common/Pagination';
import { givingService } from '@/services/giving.service';
import { formatDate } from '@/utils/date';

interface GivingRecord {
  id: string;
  member_name: string;
  amount: number;
  type: string;
  method: string;
  date: string;
}

const LIMIT = 15;

export default function PastorGiving() {
  const [page, setPage] = useState(1);
  const [showAmount, setShowAmount] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['pastor-giving', page],
    queryFn: () => givingService.getAll(page, LIMIT),
  });

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  const columns: ColumnDef<GivingRecord, any>[] = [
    { accessorKey: 'member_name', header: 'Member' },
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => formatDate(getValue()) },
    { accessorKey: 'type', header: 'Type', cell: ({ getValue }) => <span className="capitalize">{getValue()}</span> },
    {
      accessorKey: 'amount',
      header: () => (
        <span className="flex items-center gap-2">
          Amount
          <button onClick={(e) => { e.stopPropagation(); setShowAmount(v => !v); }} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <i className={showAmount ? 'ri-eye-line' : 'ri-eye-off-line'}></i>
          </button>
        </span>
      ),
      cell: ({ getValue }) => showAmount
        ? <span className="font-semibold text-green-600">₦{Number(getValue()).toLocaleString()}</span>
        : <span className="text-gray-400 tracking-widest">••••••</span>,
    },
    { accessorKey: 'method', header: 'Method', cell: ({ getValue }) => <span className="capitalize">{String(getValue()).replace('_', ' ')}</span> },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Giving Records</h3>
      <div className="bg-white rounded-xl border border-gray-200">
        <DataTable data={data?.items ?? []} columns={columns} isLoading={isLoading} emptyMessage="No giving records yet." />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
