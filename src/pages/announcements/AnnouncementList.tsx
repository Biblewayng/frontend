import { useState } from 'react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import type { Announcement } from '@/types';
import EditAnnouncementModal from '@/components/modals/EditAnnouncementModal';
import ViewAnnouncementModal from '@/components/modals/ViewAnnouncementModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import Pagination from '@/components/common/Pagination';

interface AnnouncementListProps {
  filterStatus: string;
}

export default function AnnouncementList({ filterStatus }: AnnouncementListProps) {
  const { announcements, loading, page, totalPages, setPage, deleteAnnouncement } = useAnnouncements(filterStatus !== 'all' ? { status: filterStatus } : undefined);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<string | null>(null);

  if (loading) return <div className="text-center py-12">Loading announcements...</div>;

  const handleEdit = (id: string) => { setSelectedAnnouncement(id); setShowEditModal(true); };
  const handleDelete = (id: string) => { setSelectedAnnouncement(id); setShowDeleteConfirm(true); };
  const handleViewDetails = (id: string) => { setSelectedAnnouncement(id); setShowDetailsModal(true); };
  const confirmDelete = async () => {
    if (selectedAnnouncement) await deleteAnnouncement(selectedAnnouncement);
    setShowDeleteConfirm(false);
    setSelectedAnnouncement(null);
  };

  const filteredAnnouncements: Announcement[] = announcements;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {filteredAnnouncements.map((announcement: Announcement) => (
        <div key={announcement.id} className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {announcement.title}
                  </h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(announcement.status)}`}>
                    {announcement.status}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  {announcement.created_by_name && (
                    <div className="flex items-center">
                      <i className="ri-user-line mr-1"></i>
                      {announcement.created_by_name}
                    </div>
                  )}
                  <div className="flex items-center">
                    <i className="ri-calendar-line mr-1"></i>
                    {new Date((announcement.publish_date || announcement.publishDate) || '').toLocaleDateString()}
                  </div>
                </div>

                <p className="text-gray-700 line-clamp-2">
                  {announcement.content}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => handleViewDetails(announcement.id)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer whitespace-nowrap"
                  >
                    View Details
                  </button>
                  
                  <div className="flex items-center space-x-3">
                    <button onClick={() => handleEdit(announcement.id)} className="p-2 text-gray-400 hover:text-blue-600 cursor-pointer" title="Edit">
                      <i className="ri-edit-line"></i>
                    </button>
                    <button onClick={() => handleDelete(announcement.id)} className="p-2 text-gray-400 hover:text-red-600 cursor-pointer" title="Delete">
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>

                {(announcement.expiry_date || announcement.expiryDate) && (
                  <div className="mt-3 text-sm text-gray-500">
                    <i className="ri-time-line mr-1"></i>
                    Expires on {new Date((announcement.expiry_date || announcement.expiryDate) || '').toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-megaphone-line text-gray-400 text-4xl mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
          <p className="text-gray-500">
            {filterStatus === 'all' 
              ? 'Create your first announcement to get started.' 
              : `No ${filterStatus} announcements at the moment.`
            }
          </p>
        </div>
      )}

      {showEditModal && selectedAnnouncement && (
        <EditAnnouncementModal isOpen={showEditModal} onClose={() => setShowEditModal(false)}
          announcementId={selectedAnnouncement}
          announcement={announcements.find((a: Announcement) => a.id === selectedAnnouncement)!}
          onSuccess={() => setShowEditModal(false)} />
      )}
      {showDetailsModal && selectedAnnouncement && (
        <ViewAnnouncementModal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)}
          announcement={announcements.find((a: Announcement) => a.id === selectedAnnouncement)!} />
      )}
      <ConfirmDialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete} title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmText="Delete" type="danger" />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
