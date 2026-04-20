import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useEvents } from '@/hooks/useEvents';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
}

export default function EditEventModal({ isOpen, onClose, eventId }: EditEventModalProps) {
  const { getEvent, updateEvent } = useEvents();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    start_time: '',
    end_time: '',
    location: '',
    type: 'general',
    capacity: '',
    registrationRequired: true,
    registrationDeadline: '',
    organizer: '',
    cost: '',
    recurring: false,
    recurringType: 'weekly'
  });

  useEffect(() => {
    if (isOpen && eventId) {
      fetchEvent();
    }
  }, [isOpen, eventId]);

  const fetchEvent = async () => {
    try {
      setLoadingData(true);
      const event = await getEvent(eventId.toString());
      setFormData({
        title: event.title || '',
        description: event.description || '',
        startDate: event.date ? event.date.split('T')[0] : '',
        endDate: event.end_date ? event.end_date.split('T')[0] : '',
        start_time: event.start_time || '',
        end_time: event.end_time || '',
        location: event.location || '',
        type: event.type || 'general',
        capacity: event.capacity?.toString() || '',
        registrationRequired: event.registration_required ?? true,
        registrationDeadline: event.registration_deadline ? event.registration_deadline.split('T')[0] : '',
        organizer: event.organizer || '',
        cost: event.cost?.toString() || '',
        recurring: event.recurring || false,
        recurringType: event.recurring_type || 'weekly'
      });
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateEvent(eventId.toString(), formData);
      onClose();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
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
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-0">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Edit Event</h3>
              <p className="text-sm text-gray-500 mt-1">Update event details</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
          
          {loadingData ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading event data...</p>
              </div>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="px-6 py-6 space-y-8">
            <div className="bg-gray-50 rounded-lg p-6 space-y-5">
              <div className="flex items-center space-x-2 mb-4">
                <i className="ri-information-line text-blue-600 text-xl"></i>
                <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  maxLength={500}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">{formData.description.length}/500 characters</p>
              </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-5">
              <div className="flex items-center space-x-2 mb-4">
                <i className="ri-calendar-line text-blue-600 text-xl"></i>
                <h4 className="text-lg font-semibold text-gray-900">Date & Time</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="start_time"
                  required
                  value={formData.start_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-5">
              <div className="flex items-center space-x-2 mb-4">
                <i className="ri-map-pin-line text-blue-600 text-xl"></i>
                <h4 className="text-lg font-semibold text-gray-900">Location & Details</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="general">General</option>
                  <option value="worship">Worship</option>
                  <option value="fellowship">Fellowship</option>
                  <option value="outreach">Outreach</option>
                  <option value="education">Education</option>
                  <option value="youth">Youth</option>
                  <option value="children">Children</option>
                  <option value="seniors">Seniors</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organizer
                </label>
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cost
                </label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-5">
              <div className="flex items-center space-x-2 mb-4">
                <i className="ri-user-add-line text-blue-600 text-xl"></i>
                <h4 className="text-lg font-semibold text-gray-900">Registration Settings</h4>
              </div>
              
              <div className="space-y-5">
                <div className="flex items-center bg-white rounded-lg p-4 border border-gray-200">
                  <input
                    id="registration-required"
                    name="registrationRequired"
                    type="checkbox"
                    checked={formData.registrationRequired}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="registration-required" className="ml-3 text-sm font-medium text-gray-700">
                    Registration required for this event
                  </label>
                </div>

                {formData.registrationRequired && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Maximum Attendees
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Unlimited"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Registration Deadline
                      </label>
                      <input
                        type="date"
                        name="registrationDeadline"
                        value={formData.registrationDeadline}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-5">
              <div className="flex items-center space-x-2 mb-4">
                <i className="ri-repeat-line text-blue-600 text-xl"></i>
                <h4 className="text-lg font-semibold text-gray-900">Recurring Event</h4>
              </div>
              
              <div className="space-y-5">
                <div className="flex items-center bg-white rounded-lg p-4 border border-gray-200">
                  <input
                    id="recurring"
                    name="recurring"
                    type="checkbox"
                    checked={formData.recurring}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="recurring" className="ml-3 text-sm font-medium text-gray-700">
                    This is a recurring event
                  </label>
                </div>

                {formData.recurring && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Recurring Type
                    </label>
                    <select
                      name="recurringType"
                      value={formData.recurringType}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center">
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <i className="ri-save-line mr-2"></i>
                    Save Changes
                  </span>
                )}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
