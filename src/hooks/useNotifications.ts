import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications.service';
import { notificationSSE } from '@/services/notificationSSE';

export const NOTIFICATIONS_KEY = 'notifications';
export const UNREAD_COUNT_KEY = 'notifications-unread-count';

export const useNotifications = () => {
  const qc = useQueryClient();

  useEffect(() => {
    const unsub = notificationSSE.subscribe(() => {
      qc.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
      qc.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
    });
    return unsub;
  }, [qc]);

  return {
    markAsRead: notificationsService.markAsRead,
    markAllAsRead: notificationsService.markAllAsRead,
  };
};
