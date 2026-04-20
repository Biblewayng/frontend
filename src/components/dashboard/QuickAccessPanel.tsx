import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import wsClient from '@/services/LivestreamWebSocket';

const quickActionsConfig = [
  {
    title: 'Membership Management',
    description: 'Add, edit, and manage church members',
    icon: 'ri-group-line',
    href: '/membership',
    color: 'bg-blue-500',
    statsKey: 'members'
  },
  {
    title: 'Sermon Library',
    description: 'Upload, organize, and manage sermons',
    icon: 'ri-book-open-line',
    href: '/sermons',
    color: 'bg-green-500',
    statsKey: 'sermons'
  },
  {
    title: 'Live Streaming',
    description: 'Broadcast services to online congregation',
    icon: 'ri-live-line',
    href: '/live',
    color: 'bg-red-500',
    statsKey: 'livestream'
  },
  {
    title: 'Event Management',
    description: 'Plan and organize church events',
    icon: 'ri-calendar-event-line',
    href: '/events',
    color: 'bg-purple-500',
    statsKey: 'events'
  },
  {
    title: 'Announcements',
    description: 'Share important updates with congregation',
    icon: 'ri-megaphone-line',
    href: '/announcements',
    color: 'bg-orange-500',
    statsKey: 'announcements'
  },
  {
    title: 'Forms Management',
    description: 'Create and manage registration forms',
    icon: 'ri-file-list-line',
    href: '/forms',
    color: 'bg-teal-500',
    statsKey: 'forms'
  }
];

export default function QuickAccessPanel() {
  const { getDashboardStats } = useDashboard();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch stats:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    wsClient.connect(null);
    const offStats = wsClient.on('stats', (data: any) => {
      if (data?.current_viewers !== undefined) setStats((s: any) => ({ ...s, liveViewers: data.current_viewers }));
      if (data?.is_live !== undefined) setStats((s: any) => ({ ...s, isLive: data.is_live }));
    });
    const offStatus = wsClient.on('stream-status', (data: any) => {
      if (data?.is_live !== undefined) setStats((s: any) => ({ ...s, isLive: data.is_live }));
      if (data?.current_viewers !== undefined) setStats((s: any) => ({ ...s, liveViewers: data.current_viewers }));
    });
    const offEnded = wsClient.on('stream-ended', () => setStats((s: any) => ({ ...s, isLive: false, liveViewers: 0 })));
    return () => { offStats(); offStatus(); offEnded(); wsClient.disconnect(); };
  }, []);

  const getStatsDisplay = (statsKey: string) => {
    if (loading) return 'Loading...';
    
    switch(statsKey) {
      case 'members':
        return `${stats.totalMembers || 0} Active Members`;
      case 'sermons':
        return `${stats.totalSermons || 0} Sermons`;
      case 'livestream':
        return stats.isLive ? `${stats.liveViewers || 0} Viewers` : 'Go Live Now';
      case 'events':
        return `${stats.upcomingEvents || 0} Upcoming Events`;
      case 'announcements':
        return `${stats.activeAnnouncements || 0} Active`;
      case 'forms':
        return `${stats.totalForms || 0} Forms`;
      default:
        return '';
    }
  };
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Access</h3>
        <p className="mt-1 text-sm text-gray-500">
          Manage your church operations efficiently
        </p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {quickActionsConfig.map((action) => (
            <Link
              key={action.title}
              to={action.href}
              className="relative group bg-gradient-to-br from-white to-gray-50 p-5 border border-gray-200 rounded-xl hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100/50 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="relative">
                <div className={`${action.color} w-11 h-11 flex items-center justify-center rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200`}>
                  <i className={`${action.icon} text-white text-lg`}></i>
                </div>
                <div className="mt-3">
                  <h4 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 leading-snug">
                    {action.description}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm font-semibold text-blue-600">
                      {getStatsDisplay(action.statsKey)}
                    </p>
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
                      <i className="ri-arrow-right-line text-blue-600 text-sm group-hover:translate-x-0.5 transition-transform"></i>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
