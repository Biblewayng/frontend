import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

export const DASHBOARD_KEY = 'dashboard';

export const useDashboard = () => {
  return {
    getDashboardStats: dashboardService.getStats,
    getRecentActivity: dashboardService.getActivity,
    getMemberStats: dashboardService.getMemberStats,
    getMemberRecentSermons: dashboardService.getMemberRecentSermons,
    getMemberUpcomingEvents: dashboardService.getMemberUpcomingEvents,
  };
};

export const useDashboardStats = () =>
  useQuery({ queryKey: [DASHBOARD_KEY, 'stats'], queryFn: dashboardService.getStats });

export const useDashboardActivity = () =>
  useQuery({ queryKey: [DASHBOARD_KEY, 'activity'], queryFn: dashboardService.getActivity });
