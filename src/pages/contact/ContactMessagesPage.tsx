import { useState } from 'react';
import { toast } from 'sonner';
import { type ColumnDef } from '@tanstack/react-table';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DataTable from '@/components/common/DataTable';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import { useContactMessages, useReplyContact, useDeleteContact } from '@/hooks/useContact';

interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  replied: boolean;
  replied_at: string | null;
  created_at: string;
}

function ReplyModal({ msg, onClose }: { msg: ContactMessage; onClose: () => void }) {
  const [reply, setReply] = useState('');
  const { mutateAsync, isPending } = useReplyContact();

  const handleSend = async () => {
    if (!reply.trim()) return;
    try {
      await mutateAsync({ id: msg.id, reply });
      toast.success('Reply sent');
      onClose();
    } catch {
      toast.error('Failed to send reply');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Reply to {msg.name}</h3>
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">{msg.message}</div>
        <textarea
          rows={5}
          value={reply}
          onChange={e => setReply(e.target.value)}
          placeholder="Write your reply..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
          <button
            onClick={handleSend}
            disabled={isPending || !reply.trim()}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Sending...' : 'Send reply'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ConfirmDeleteModal { id: string; name: string }

export default function ContactMessagesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConfirmDeleteModal | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 20;
  const { data, isLoading } = useContactMessages(page);
  const { mutateAsync: deleteMsg } = useDeleteContact();
  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMsg(deleteTarget.id);
    toast.success('Message deleted');
    setDeleteTarget(null);
  };

  const columns: ColumnDef<ContactMessage, any>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email', cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'phone', header: 'Phone', cell: ({ getValue }) => getValue() || '—' },
    {
      accessorKey: 'message',
      header: 'Message',
      cell: ({ getValue }) => {
        const v = getValue() as string;
        return <span title={v}>{v.length > 60 ? v.slice(0, 60) + '…' : v}</span>;
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ getValue }) => new Date(getValue() + 'Z').toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.email && (
            <button
              onClick={() => setReplyTarget(row.original)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Reply
            </button>
          )}
          <button
            onClick={() => setDeleteTarget({ id: row.original.id, name: row.original.name })}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
          >
            <i className="ri-delete-bin-line text-base"></i>
          </button>
        </div>
      ),
    },
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
                <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
                <p className="mt-1 text-gray-600">Messages submitted via the public contact form.</p>
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
                emptyMessage="No contact messages yet."
              />
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        </main>
      </div>
      {replyTarget && <ReplyModal msg={replyTarget} onClose={() => setReplyTarget(null)} />}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete message"
        message={`Are you sure you want to delete the message from ${deleteTarget?.name}? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}
