export interface DashboardStats {
  totalMembers: number;
  totalSermons: number;
  totalEvents: number;
  totalGiving: number;
  recentMembers: number;
  upcomingEvents: number;
  activeAnnouncements: number;
}

export interface MemberDashboardStats {
  eventsAttended: number;
  sermonsListened: number;
  givingTotal: number;
  prayerRequests: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId?: string;
}
