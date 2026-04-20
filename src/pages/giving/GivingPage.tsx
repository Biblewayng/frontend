import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DataTable from '@/components/common/DataTable';
import Pagination from '@/components/common/Pagination';
import { givingService } from '@/services/giving.service';

interface GivingRecord {
  id: string;
  member_id: string;
  member_name: string;
  amount: number;
  type: string;
  method: string;
  date: string;
}

const LIMIT = 15;

export default function GivingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showAmount, setShowAmount] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-giving', page],
    queryFn: () => givingService.getAll(page, LIMIT),
  });

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  const columns: ColumnDef<GivingRecord, any>[] = [
    { accessorKey: 'member_name', header: 'Member' },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
    },
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
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Giving</h1>
                <p className="mt-1 text-gray-600">All giving records from members.</p>
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <DataTable
                data={data?.items ?? []}
                columns={columns}
                isLoading={isLoading}
                globalFilter={search}
                emptyMessage="No giving records yet."
              />
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
