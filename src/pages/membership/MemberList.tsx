
import { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { useMembers } from '@/hooks/useMembers';
import type { Member } from '@/types';
import { getInitials, getAvatarColor } from '@/utils/avatar';
import EditMemberModal from '@/components/modals/EditMemberModal';
import ViewMemberModal from '@/components/modals/ViewMemberModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import DataTable from '@/components/common/DataTable';
import Pagination from '@/components/common/Pagination';

interface MemberListProps {
  searchTerm: string;
  filterRole: string;
}

export default function MemberList({ searchTerm, filterRole }: MemberListProps) {
  const { members, loading, deleteMember, page, totalPages, setPage } = useMembers({ search: searchTerm || undefined, role: filterRole !== 'all' ? filterRole : undefined });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = async () => {
    if (!memberToDelete) return;
    try {
      await deleteMember(memberToDelete.id);
      setShowDeleteConfirm(false);
      setMemberToDelete(null);
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  const filteredMembers: Member[] = Array.isArray(members) ? members : [];

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const columns = useMemo<ColumnDef<Member>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedMembers.includes(row.original.id)}
          onChange={() => toggleMember(row.original.id)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
    },
    {
      accessorKey: 'name',
      header: 'Member',
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${getAvatarColor(row.original.name)}`}>
            {getInitials(row.original.name)}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{row.original.name}</div>
            <div className="text-sm text-gray-500">Member since {new Date(row.original.dateJoined).getFullYear()}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Contact',
      cell: ({ row }) => (
        <div>
          <div className="text-sm text-gray-900">{row.original.email}</div>
          <div className="text-sm text-gray-500">{row.original.phone}</div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Roles',
      cell: ({ row }) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          row.original.role === 'leader' ? 'bg-purple-100 text-purple-800' :
          row.original.role === 'volunteer' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {row.original.role}
        </span>
      ),
    },
    {
      accessorKey: 'membershipStatus',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          row.original.membershipStatus === 'active' ? 'bg-green-100 text-green-800' :
          row.original.membershipStatus === 'inactive' ? 'bg-gray-100 text-gray-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.original.membershipStatus}
        </span>
      ),
    },
    {
      accessorKey: 'dateJoined',
      header: 'Date Joined',
      cell: ({ row }) => new Date(row.original.dateJoined).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end space-x-2">
          <button 
            onClick={() => {
              setSelectedMember(row.original.id);
              setShowEditModal(true);
            }}
            className="text-blue-600 hover:text-blue-900 cursor-pointer"
            title="Edit"
          >
            <i className="ri-edit-line"></i>
          </button>
          <button 
            onClick={() => {
              setSelectedMember(row.original.id);
              setShowViewModal(true);
            }}
            className="text-green-600 hover:text-green-900 cursor-pointer"
            title="View Details"
          >
            <i className="ri-eye-line"></i>
          </button>
          <button 
            onClick={() => {
              setMemberToDelete({ id: row.original.id, name: row.original.name });
              setShowDeleteConfirm(true);
            }}
            className="text-red-600 hover:text-red-900 cursor-pointer"
            title="Delete"
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      ),
    },
  ], [selectedMembers]);

  if (loading) {
    return <div className="text-center py-12">Loading members...</div>;
  }

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
        <DataTable
          data={filteredMembers}
          columns={columns}
          isLoading={loading}
          emptyMessage="No members found"
          globalFilter={searchTerm}
        />
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Member"
        message={`Are you sure you want to delete ${memberToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />

      {selectedMember && (
        <>
          <EditMemberModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            memberId={selectedMember}
          />
          <ViewMemberModal
            isOpen={showViewModal}
            onClose={() => setShowViewModal(false)}
            memberId={selectedMember}
          />
        </>
      )}

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-user-search-line text-gray-400 text-4xl mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
