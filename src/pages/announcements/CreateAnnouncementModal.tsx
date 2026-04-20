import { useState } from 'react';
import { toast } from 'sonner';
import { useAnnouncements } from '@/hooks/useAnnouncements';

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateAnnouncementModal({ isOpen, onClose, onSuccess }: CreateAnnouncementModalProps) {
  const { createAnnouncement } = useAnnouncements();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium',
    publishDate: '',
    expiryDate: '',
    sendEmail: false,
    sendSms: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAnnouncement({
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        publish_date: formData.publishDate || new Date().toISOString(),
        expiry_date: formData.expiryDate || null,
        status: 'published',
        send_email: formData.sendEmail,
        send_sms: formData.sendSms
      });
      onSuccess?.();
      onClose();
    setFormData({
      title: '',
      content: '',
      category: 'general',
      priority: 'medium',
      publishDate: '',
      expiryDate: '',
      sendEmail: false,
      sendSms: false
    });
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-0">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Create New Announcement</h3>
              <p className="text-sm text-gray-500 mt-1">Share important updates with your congregation</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>

          <form id="create-announcement-form" onSubmit={handleSubmit} className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="px-6 py-6 space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 space-y-5">
              <div className="flex items-center space-x-2 mb-4">
                <i className="ri-megaphone-line text-blue-600 text-xl"></i>
                <h4 className="text-lg font-semibold text-gray-900">Announcement Details</h4>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  required
                  rows={4}
                  maxLength={500}
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Write your announcement content..."
                />
                <p className="text-xs text-gray-500 mt-2">{formData.content.length}/500 characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="general">General</option>
                  <option value="service-updates">Service Updates</option>
                  <option value="events">Events</option>
                  <option value="bible-study">Bible Study</option>
                  <option value="ministry">Ministry</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-5">
              <div className="flex items-center space-x-2 mb-4">
                <i className="ri-calendar-schedule-line text-blue-600 text-xl"></i>
                <h4 className="text-lg font-semibold text-gray-900">Schedule</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Publish Date
                  </label>
                  <input
                    type="datetime-local"
                    name="publishDate"
                    value={formData.publishDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2">Leave empty to publish immediately</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-5">
              <div className="flex items-center space-x-2 mb-4">
                <i className="ri-notification-line text-blue-600 text-xl"></i>
                <h4 className="text-lg font-semibold text-gray-900">Notification Settings</h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center bg-white rounded-lg p-4 border border-gray-200">
                  <input
                    id="send-email"
                    name="sendEmail"
                    type="checkbox"
                    checked={formData.sendEmail}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="send-email" className="ml-3 text-sm font-medium text-gray-700">
                    Send email notification to all members
                  </label>
                </div>
                <div className="flex items-center bg-white rounded-lg p-4 border border-gray-200">
                  <input
                    id="send-sms"
                    name="sendSms"
                    type="checkbox"
                    checked={formData.sendSms}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="send-sms" className="ml-3 text-sm font-medium text-gray-700">
                    Send SMS notification (high priority only)
                  </label>
                </div>
              </div>
            </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center">
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Publishing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <i className="ri-send-plane-line mr-2"></i>
                    Publish Announcement
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
