import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  viewMode?: 'table' | 'grid';
  renderCard?: (row: T) => React.ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  globalFilter?: string;
}

export default function DataTable<T>({
  data,
  columns,
  viewMode = 'table',
  renderCard,
  isLoading,
  emptyMessage = 'No data found.',
  globalFilter = '',
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (viewMode === 'grid' && renderCard) {
    const rows = table.getRowModel().rows;
    if (!rows.length) return <p className="p-6 text-sm text-gray-500 text-center">{emptyMessage}</p>;
    return (
      <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {rows.map(row => <div key={row.id}>{renderCard(row.original)}</div>)}
      </div>
    );
  }

  const rows = table.getRowModel().rows;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              {hg.headers.map(header => (
                <th key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none"
                  style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                >
                  <span className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <i className={`ri-arrow-up-down-line text-gray-400 text-xs ${
                        header.column.getIsSorted() === 'asc' ? 'text-blue-500' :
                        header.column.getIsSorted() === 'desc' ? 'text-blue-500 rotate-180' : ''
                      }`} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.length ? rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-10 text-center text-sm text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
