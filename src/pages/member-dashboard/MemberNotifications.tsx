import { useState } from 'react';
import { formatDateTime } from '@/utils/date';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notificationsService } from '@/services/notifications.service';
import { NOTIFICATIONS_KEY, UNREAD_COUNT_KEY } from '@/hooks/useNotifications';
import Pagination from '@/components/common/Pagination';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function MemberNotifications() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);
  const { permission, isSubscribed, subscribe, unsubscribe, loading: pushLoading } = usePushNotifications();

  const { data, isLoading } = useQuery({
    queryKey: [NOTIFICATIONS_KEY, page],
    queryFn: () => notificationsService.getAll(page),
    placeholderData: keepPreviousData,
  });

  const notifications = (data as any)?.data ?? [];
  const totalPages = (data as any)?.pages ?? 1;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    qc.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
  };

  const handleMarkAsRead = async (id: string) => {
    await notificationsService.markAsRead(id);
    invalidate();
  };

  const handleMarkAllAsRead = async () => {
    await notificationsService.markAllAsRead();
    invalidate();
    toast.success('All notifications marked as read');
  };

  const handleOpen = async (n: any) => {
    setSelected(n);
    if (!n.read) await handleMarkAsRead(n.id);
  };

  return (
    <div>
      {/* Push Notification Banner - Always visible per user request */}
      <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`mt-1 p-2 rounded-lg ${isSubscribed ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-400 border border-gray-100'}`}>
              <i className="ri-notification-3-line text-xl"></i>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Browser Notifications</h4>
              <p className="text-xs text-gray-600 mt-0.5 max-w-md">
                {isSubscribed 
                  ? 'You are receiving real-time alerts for livestreams and announcements.' 
                  : 'Get notified instantly when we go live or post important updates directly on your device.'}
              </p>
            </div>
          </div>
          
          {permission === 'denied' ? (
            <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100 flex items-center shrink-0">
              <i className="ri-error-warning-line mr-2"></i>
              Blocked in browser
            </div>
          ) : (
            <button
              onClick={isSubscribed ? unsubscribe : subscribe}
              disabled={pushLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isSubscribed 
                  ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
              }`}
            >
              {pushLoading ? (
                <i className="ri-loader-4-line animate-spin mr-2"></i>
              ) : (
                <i className={`${isSubscribed ? 'ri-notification-off-line' : 'ri-notification-3-line'} mr-2`}></i>
              )}
              {isSubscribed ? 'Disable Notifications' : 'Enable Notifications'}
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        {notifications.some((n: any) => !n.read) && (
          <button onClick={handleMarkAllAsRead} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="ri-notification-off-line text-4xl mb-2"></i>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <div key={n.id} onClick={() => handleOpen(n)}
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                n.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
              }`}>
              <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-gray-300' : 'bg-blue-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{n.type}</p>
                <p className="text-sm text-gray-600 truncate">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.created_at)}</p>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400 mt-1"></i>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Details Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {selected.type}
              </span>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <p className="text-gray-900 text-base leading-relaxed mb-4">{selected.message}</p>
            <p className="text-xs text-gray-400 mb-6">{formatDateTime(selected.created_at)}</p>
            <div className="flex gap-3">
              {!selected.read && (
                <button onClick={() => { handleMarkAsRead(selected.id); setSelected({ ...selected, read: true }); }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                  Mark as read
                </button>
              )}
              {selected.link && (
                <a href={selected.link} target="_blank" rel="noopener noreferrer" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm text-center hover:bg-blue-700">
                  Visit
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
