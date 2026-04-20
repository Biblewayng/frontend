import { useState, useEffect, lazy, Suspense } from 'react';
import { formatTime as formatDuration } from '@/utils/time';
import { elapsedSeconds } from '@/utils/date';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotifications, UNREAD_COUNT_KEY } from '@/hooks/useNotifications';
import { notificationsService } from '@/services/notifications.service';
import { livestreamService } from '@/services/livestream.service';
import { useQuery } from '@tanstack/react-query';
import { LivestreamPlayerProvider, useLivestreamPlayerContext } from '@/context/LivestreamPlayerContext';
import MemberOverview from './MemberOverview';
import MemberSermons from './MemberSermons';
import MemberLivestream from './MemberLivestream';
import MemberNotifications from './MemberNotifications';
import MemberProfile from './MemberProfile';
import LivestreamWebSocket from '@/services/LivestreamWebSocket';

const AudioPlayer = lazy(() => import('@/components/AudioPlayer'));
const PlaylistPlayer = lazy(() => import('@/components/PlaylistPlayer'));
const MemberEvents = lazy(() => import('./MemberEvents'));
const MemberGiving = lazy(() => import('./MemberGiving'));
const MemberPrayer = lazy(() => import('./MemberPrayer'));
const MemberPlaylists = lazy(() => import('./playlists/MemberPlaylists'));

const LoadingSpinner = () => <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
  { id: 'livestream', label: 'Live Stream', icon: 'ri-live-line' },
  { id: 'sermons', label: 'Sermons', icon: 'ri-book-open-line' },
  { id: 'playlists', label: 'Playlists', icon: 'ri-play-list-line' },
  { id: 'events', label: 'Events', icon: 'ri-calendar-line' },
  { id: 'giving', label: 'Giving', icon: 'ri-hand-heart-line' },
  { id: 'prayer', label: 'Prayer Requests', icon: 'ri-heart-line' },
  { id: 'notifications', label: 'Notifications', icon: 'ri-notification-2-line' },
  { id: 'profile', label: 'Profile', icon: 'ri-user-line' },
];


function MiniLiveBar({ title, startTime, onOpen }: { title?: string; startTime?: string; onOpen: () => void }) {
  const { isPlaying, handlePlay } = useLivestreamPlayerContext();
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const update = () => setElapsed(elapsedSeconds(startTime));
    update();
    const id = window.setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  return (
    <div
      onClick={onOpen}
      className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white z-50 px-4 py-4 flex items-center shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
    >
      {/* Left: LIVE badge */}
      <div className="w-24 shrink-0">
        <span className="flex items-center gap-1.5 bg-red-600 px-2 py-0.5 rounded-full text-xs font-bold w-fit">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>LIVE
        </span>
      </div>

      {/* Center: play/pause + title */}
      <div className="flex-1 flex flex-col items-center gap-0.5 -mt-1">
        <button
          onClick={e => { e.stopPropagation(); handlePlay(); }}
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
        >
          <i className={`${isPlaying ? 'ri-pause-fill' : 'ri-play-fill'} text-2xl`}></i>
        </button>
        <span className="text-xs opacity-80 truncate max-w-xs">{title || 'Live Audio Stream'}</span>
      </div>

      {/* Right: time */}
      <div className="w-24 shrink-0 flex justify-end pr-6">
        <span className="text-xs font-mono opacity-80">{formatDuration(elapsed)}</span>
      </div>
    </div>
  );
}

export default function MemberDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  useNotifications();

  const validTabs = TABS.map(t => t.id);
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(validTabs.includes(tabFromUrl!) ? tabFromUrl! : 'overview');
  const [currentSermon, setCurrentSermon] = useState<any>(null);
  const [playlistSermons, setPlaylistSermons] = useState<any[]>([]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Sync if URL param changes externally
  useEffect(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const { data: unreadData } = useQuery({
    queryKey: [UNREAD_COUNT_KEY],
    queryFn: () => notificationsService.getUnreadCount(),
    enabled: !!user?.id,
  });
  const unreadCount = (unreadData as any)?.count ?? 0;

  const { data: streamData, refetch: refetchStream } = useQuery({
    queryKey: ['current-livestream'],
    queryFn: livestreamService.getCurrent,
  });
  const currentStream = streamData?.id ? streamData : null;

  useEffect(() => {
    LivestreamWebSocket.connect(null);
    const unbind = LivestreamWebSocket.on('stream-status', () => refetchStream());
    const unbindUpdate = LivestreamWebSocket.on('stream-update', () => refetchStream());
    const unbindChange = LivestreamWebSocket.on('stream-status-change', () => refetchStream());
    
    return () => {
      unbind();
      unbindUpdate();
      unbindChange();
      LivestreamWebSocket.disconnect();
    };
  }, []);

  return (
    <LivestreamPlayerProvider
      streamId={currentStream?.id}
      streamUrl={currentStream?.stream_url}
      isLive={currentStream?.is_live || false}
    >
    <div className={`min-h-screen bg-gray-50${activeTab !== 'livestream' && currentStream?.is_live ? ' pb-16' : ''}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600" style={{ fontFamily: 'Pacifico, serif' }}>Bibleway</div>
            </div>
          <div className="flex items-center justify-center flex-1">
              {user?.role && user.role !== 'member' && (
                <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                  <i className="ri-dashboard-line"></i>
                  Admin
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative">
                <button onClick={() => handleTabChange('notifications')}
                  className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer relative">
                  <i className="ri-notification-2-line"></i>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>
              <button onClick={() => { logout(); navigate('/'); }} className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'Member'}!</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6 sm:mb-8">
          <div className="sm:border-b border-gray-200">
            <nav className="grid grid-cols-3 gap-2 sm:gap-0 sm:flex sm:space-x-8 p-4 sm:px-6 sm:py-0">
              {TABS.map((tab) => (
                <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start py-3 sm:py-4 px-1 border sm:border-0 border-b-2 rounded-lg sm:rounded-none font-semibold text-xs sm:text-sm cursor-pointer transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-gray-300 sm:border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}>
                  <i className={`${tab.icon} sm:mr-2 text-lg sm:text-base`}></i>
                  <span className="mt-1 sm:mt-0 text-center">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'overview' && <MemberOverview onPlaySermon={setCurrentSermon} />}
            {activeTab === 'livestream' && <MemberLivestream currentStream={currentStream} loadingStream={false} />}
            {activeTab === 'sermons' && <MemberSermons currentSermon={currentSermon} onPlaySermon={setCurrentSermon} />}
            {activeTab === 'playlists' && <Suspense fallback={<LoadingSpinner />}><MemberPlaylists onPlayPlaylist={setPlaylistSermons} /></Suspense>}
            {activeTab === 'events' && <Suspense fallback={<LoadingSpinner />}><MemberEvents /></Suspense>}
            {activeTab === 'giving' && <Suspense fallback={<LoadingSpinner />}><MemberGiving /></Suspense>}
            {activeTab === 'prayer' && <Suspense fallback={<LoadingSpinner />}><MemberPrayer /></Suspense>}
            {activeTab === 'notifications' && <MemberNotifications />}
            {activeTab === 'profile' && <MemberProfile />}
          </div>
        </div>
      </div>

      {currentSermon && (
        <Suspense fallback={null}>
          <AudioPlayer sermon={currentSermon} onClose={() => setCurrentSermon(null)} />
        </Suspense>
      )}

      {playlistSermons.length > 0 && (
        <Suspense fallback={null}>
          <PlaylistPlayer sermons={playlistSermons} onClose={() => setPlaylistSermons([])} />
        </Suspense>
      )}

      {/* Mini live bar — shown when not on livestream tab */}
      {activeTab !== 'livestream' && currentStream?.is_live && (
        <MiniLiveBar
          title={currentStream.title}
          startTime={currentStream.start_time}
          onOpen={() => handleTabChange('livestream')}
        />
      )}
    </div>
    </LivestreamPlayerProvider>
  );
}
