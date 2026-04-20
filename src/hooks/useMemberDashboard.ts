import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

export const useMemberDashboard = (userId: string | number) => {
  const statsQuery = useQuery({
    queryKey: ['member-dashboard', userId, 'stats'],
    queryFn: () => dashboardService.getMemberStats(String(userId)),
    enabled: !!userId,
  });

  const sermonsQuery = useQuery({
    queryKey: ['member-dashboard', userId, 'sermons'],
    queryFn: () => dashboardService.getMemberRecentSermons(String(userId)),
    enabled: !!userId,
  });

  const eventsQuery = useQuery({
    queryKey: ['member-dashboard', userId, 'events'],
    queryFn: () => dashboardService.getMemberUpcomingEvents(String(userId)),
    enabled: !!userId,
  });

  return {
    stats: statsQuery.data ?? { downloadedSermons: 0, eventsAttended: 0 },
    recentSermons: sermonsQuery.data ?? [],
    upcomingEvents: eventsQuery.data ?? [],
    loading: statsQuery.isLoading || sermonsQuery.isLoading || eventsQuery.isLoading,
    refetch: () => { statsQuery.refetch(); sermonsQuery.refetch(); eventsQuery.refetch(); },
  };
};
