import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useNotifications, UNREAD_COUNT_KEY } from '@/hooks/useNotifications';
import { notificationsService } from '@/services/notifications.service';
import { livestreamService } from '@/services/livestream.service';
import LivestreamWebSocket from '@/services/LivestreamWebSocket';
import PastorPrayers from './PastorPrayers';
import PastorLivestream from './PastorLivestream';
import PastorGiving from './PastorGiving';
import PastorNotifications from './PastorNotifications';
import PastorCalendar from './PastorCalendar';

const TABS = [
  { id: 'prayers', label: 'Prayers', icon: 'ri-heart-line' },
  { id: 'livestream', label: 'Live Stream', icon: 'ri-live-line' },
  { id: 'giving', label: 'Giving', icon: 'ri-hand-coin-line' },
  { id: 'notifications', label: 'Notifications', icon: 'ri-notification-2-line' },
  { id: 'calendar', label: 'Calendar', icon: 'ri-calendar-line' },
];

export default function PastorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  useNotifications();

  const { data: unreadData } = useQuery({
    queryKey: [UNREAD_COUNT_KEY],
    queryFn: () => notificationsService.getUnreadCount(),
    enabled: !!user?.id,
  });
  const unreadCount = (unreadData as any)?.count ?? 0;
  const tabFromUrl = searchParams.get('tab');
  const validTabs = TABS.map(t => t.id);
  const [activeTab, setActiveTab] = useState(validTabs.includes(tabFromUrl!) ? tabFromUrl! : 'prayers');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const { data: streamData, refetch: refetchStream } = useQuery({
    queryKey: ['pastor-livestream'],
    queryFn: livestreamService.getCurrent,
  });
  const currentStream = streamData?.id ? streamData : null;

  useEffect(() => {
    LivestreamWebSocket.connect(null);
    const unbind = LivestreamWebSocket.on('stream-status', () => refetchStream());
    const unbindUpdate = LivestreamWebSocket.on('stream-update', () => refetchStream());
    return () => { unbind(); unbindUpdate(); LivestreamWebSocket.disconnect(); };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl sm:text-2xl font-bold text-blue-600" style={{ fontFamily: 'Pacifico, serif' }}>Bibleway</div>
            <div className="flex items-center gap-3">
              <button onClick={() => handleTabChange('notifications')} className="relative p-2 text-gray-400 hover:text-gray-600">
                <i className="ri-notification-2-line text-xl"></i>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <Link to="/member-dashboard" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                Member View
              </Link>
              <button onClick={() => { logout(); navigate('/'); }} className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pastor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome, {user?.name?.split(' ')[0]}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="sm:border-b border-gray-200">
            <nav className="grid grid-cols-2 gap-2 sm:gap-0 sm:flex sm:space-x-8 p-4 sm:px-6 sm:py-0">
              {TABS.map((tab) => (
                <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start py-3 sm:py-4 px-1 border sm:border-0 border-b-2 rounded-lg sm:rounded-none font-semibold text-xs sm:text-sm cursor-pointer transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-gray-300 sm:border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}>
                  <i className={`${tab.icon} sm:mr-2 text-lg sm:text-base`}></i>
                  <span className="mt-1 sm:mt-0">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'prayers' && <PastorPrayers />}
            {activeTab === 'livestream' && <PastorLivestream currentStream={currentStream} />}
            {activeTab === 'giving' && <PastorGiving />}
            {activeTab === 'notifications' && <PastorNotifications />}
            {activeTab === 'calendar' && <PastorCalendar />}
          </div>
        </div>
      </div>
    </div>
  );
}
