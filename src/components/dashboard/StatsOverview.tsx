import { useEffect, useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardStats } from '@/types';
import wsClient from '@/services/LivestreamWebSocket';

export default function StatsOverview() {
  const { getDashboardStats } = useDashboard();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveViewers, setLiveViewers] = useState<number | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
        setIsLive((data as any).isLive ?? false);
        setLiveViewers((data as any).liveViewers ?? 0);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    wsClient.connect(null);

    const offStats = wsClient.on('stats', (data: any) => {
      if (data?.current_viewers !== undefined) setLiveViewers(data.current_viewers);
      if (data?.is_live !== undefined) setIsLive(data.is_live);
    });
    const offStarted = wsClient.on('stream-started', () => setIsLive(true));
    const offEnded = wsClient.on('stream-ended', () => { setIsLive(false); setLiveViewers(0); });
    const offStatus = wsClient.on('stream-status', (data: any) => {
      if (data?.is_live !== undefined) setIsLive(data.is_live);
      if (data?.current_viewers !== undefined) setLiveViewers(data.current_viewers);
    });

    return () => {
      offStats();
      offStarted();
      offEnded();
      offStatus();
      wsClient.disconnect();
    };
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!stats) return null;

  const statItems = [
    {
      name: 'Total Members',
      value: ((stats as any).totalMembers || 0).toString(),
      change: (stats as any).newMembersThisWeek ? `+${(stats as any).newMembersThisWeek}` : '',
      changeType: 'increase',
      icon: 'ri-group-line'
    },
    {
      name: 'Weekly Attendance',
      value: ((stats as any).weeklyAttendance || 0).toString(),
      change: (stats as any).attendanceChange ? `${(stats as any).attendanceChange > 0 ? '+' : ''}${(stats as any).attendanceChange}%` : '',
      changeType: (stats as any).attendanceChange > 0 ? 'increase' : 'neutral',
      icon: 'ri-calendar-check-line'
    },
    {
      name: 'Sermon Downloads',
      value: ((stats as any).sermonDownloads || 0).toString(),
      change: (stats as any).downloadsChange ? `${(stats as any).downloadsChange > 0 ? '+' : ''}${(stats as any).downloadsChange}%` : '',
      changeType: (stats as any).downloadsChange > 0 ? 'increase' : 'neutral',
      icon: 'ri-download-line'
    },
    {
      name: isLive ? 'Live Viewers' : 'Live Stream',
      value: isLive ? (liveViewers ?? 0).toString() : 'Offline',
      change: '',
      changeType: 'neutral',
      icon: 'ri-live-line'
    }
  ];
  const iconColors = [
    { gradient: 'from-blue-500 to-blue-600' },
    { gradient: 'from-green-500 to-green-600' },
    { gradient: 'from-purple-500 to-purple-600' },
    { gradient: 'from-orange-500 to-orange-600' }
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item, index) => (
        <div key={item.name} className="relative bg-gradient-to-br from-white to-gray-50 overflow-hidden shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-100/30 to-transparent rounded-full -mr-12 -mt-12"></div>
          <div className="relative p-4">
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 flex items-center justify-center bg-gradient-to-br ${iconColors[index].gradient} rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200`}>
                <i className={`${item.icon} text-white text-xl`}></i>
              </div>
              {item.change && (
                <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  item.changeType === 'increase' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.changeType === 'increase' && (
                    <i className="ri-arrow-up-line text-xs mr-0.5"></i>
                  )}
                  {item.change}
                </div>
              )}
            </div>
            <div className="mt-3">
              <dt className="text-sm font-medium text-gray-600 truncate">
                {item.name}
              </dt>
              <dd className="mt-1">
                <div className="text-3xl font-bold text-gray-900">
                  {item.value}
                </div>
              </dd>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
