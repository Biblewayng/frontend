import { useState } from 'react';
import { formatDate } from '@/utils/date';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsService } from '@/services/events.service';
import { useEvents } from '@/hooks/useEvents';
import EventRegistrationModal from '@/components/modals/EventRegistrationModal';
import EventDetailsModal from '@/components/modals/EventDetailsModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import Pagination from '@/components/common/Pagination';
import type { Event } from '@/types';

export default function MemberEvents() {
  const { user } = useAuth();
  const { registerForEvent, unregisterFromEvent } = useEvents();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'registered'>('all');
  const [page, setPage] = useState(1);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['member-events', user?.id, filter, page],
    queryFn: () => eventsService.getMemberEvents(user!.id, page),
    enabled: !!user?.id,
  });

  const events = (data as any)?.data ?? data ?? [];
  const totalPages = (data as any)?.pages ?? 1;

  const refetch = () => qc.invalidateQueries({ queryKey: ['member-events', user?.id] });

  const handleRegister = async (eventId: string) => {
    if (!user?.id) return;
    try {
      await registerForEvent(eventId, user.id);
      setShowRegistrationModal(false);
      refetch();
    } catch (error) {
      console.error('Error registering:', error);
        toast.error('Failed to register for event');
    }
  };

  const handleUnregister = async () => {
    if (!user?.id || !selectedEvent?.id) return;
    try {
      await unregisterFromEvent(selectedEvent.id, user.id);
      setShowCancelConfirm(false);
      refetch();
    } catch (error) {
      console.error('Error unregistering:', error);
        toast.error('Failed to unregister from event');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Events</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('registered')}
            className={`px-3 py-2 text-sm rounded-lg cursor-pointer whitespace-nowrap ${
              filter === 'registered' 
                ? 'bg-blue-600 text-white' 
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Registered
          </button>
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-2 text-sm rounded-lg cursor-pointer whitespace-nowrap ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Events
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="ri-calendar-line text-4xl mb-2"></i>
          <p>No events found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event: Event & { is_registered?: boolean; end_date?: string }) => (
            <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                    <span className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      event.is_registered 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {event.is_registered ? 'Registered' : 'Available'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <i className="ri-calendar-line mr-2"></i>
                    {formatDate(event.date)}
                    {event.end_date && ` - ${formatDate(event.end_date)}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    <i className="ri-map-pin-line mr-2"></i>
                    {event.location}
                  </p>
                </div>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                  {event.type}
                </span>
              </div>
              <div className="flex space-x-3">
                {event.is_registered ? (
                  <>
                    <button 
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowDetailsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer whitespace-nowrap"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowCancelConfirm(true);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm cursor-pointer whitespace-nowrap"
                    >
                      Cancel Registration
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowRegistrationModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm cursor-pointer whitespace-nowrap"
                    >
                      Register
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowDetailsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer whitespace-nowrap"
                    >
                      Learn More
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEvent && (
        <>
          <EventRegistrationModal
            isOpen={showRegistrationModal}
            onClose={() => {
              setShowRegistrationModal(false);
              handleRegister(selectedEvent.id);
            }}
            eventTitle={selectedEvent.title}
          />
          
          <EventDetailsModal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            event={selectedEvent}
          />

          <ConfirmDialog
            isOpen={showCancelConfirm}
            onClose={() => setShowCancelConfirm(false)}
            onConfirm={handleUnregister}
            title="Cancel Registration"
            message={`Are you sure you want to cancel your registration for "${selectedEvent.title}"?`}
            confirmText="Cancel Registration"
            type="warning"
          />
        </>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
