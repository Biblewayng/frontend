import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settings.service';
import { notificationsService } from '@/services/notifications.service';

export const SETTINGS_KEY = 'settings';

export const useSettings = (category?: string) => {
  const qc = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: [SETTINGS_KEY, category],
    queryFn: () => settingsService.getAll(category),
  });

  const systemStatusQuery = useQuery({
    queryKey: [SETTINGS_KEY, 'system-status'],
    queryFn: settingsService.getSystemStatus,
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, value, cat }: { key: string; value: string; cat?: string }) =>
      settingsService.update(key, value, cat),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SETTINGS_KEY] }),
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: settingsService.bulkUpdate,
    onSuccess: () => qc.invalidateQueries({ queryKey: [SETTINGS_KEY] }),
  });

  const notificationsQuery = useQuery({
    queryKey: [SETTINGS_KEY, 'recent-notifications'],
    queryFn: () => settingsService.getAll('notifications'),
  });

  return {
    settings: settingsQuery.data ?? {},
    settingsLoading: settingsQuery.isLoading,
    systemStatus: systemStatusQuery.data ?? {},
    systemStatusLoading: systemStatusQuery.isLoading,
    recentNotifications: Array.isArray(notificationsQuery.data) ? notificationsQuery.data : [],
    notificationsLoading: notificationsQuery.isLoading,
    getSettings: settingsService.getAll,
    getSettingByKey: settingsService.getByKey,
    updateSetting: (key: string, value: string, cat?: string) => updateMutation.mutateAsync({ key, value, cat }),
    updateBulkSettings: bulkUpdateMutation.mutateAsync,
    getSystemStatus: settingsService.getSystemStatus,
    getSecurityStats: settingsService.getSecurityStats,
    getRecentNotifications: () => notificationsService.getAll(1, 10),
    testEmail: settingsService.testEmail,
    getIntegrationStats: settingsService.getIntegrationStats,
    testIntegration: settingsService.testIntegration,
  };
};
