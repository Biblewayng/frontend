import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotifications, NOTIFICATIONS_KEY, UNREAD_COUNT_KEY } from '@/hooks/useNotifications';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications.service';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { markAsRead } = useNotifications();
  const qc = useQueryClient();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: notifData } = useQuery({
    queryKey: [NOTIFICATIONS_KEY, 1],
    queryFn: () => notificationsService.getAll(1, 3),
    enabled: !!user?.id,
  });
  const { data: unreadData } = useQuery({
    queryKey: [UNREAD_COUNT_KEY],
    queryFn: () => notificationsService.getUnreadCount(),
    enabled: !!user?.id,
  });

  const notifications = (notifData as any)?.data?.slice(0, 3) ?? [];
  const unreadCount = (unreadData as any)?.count ?? 0;

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
      qc.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
      qc.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
    }
    if (notification.link) window.open(notification.link, '_blank');
    setShowNotifications(false);
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const getTimeAgo = (createdAt: string) => {
    const now = new Date();
    // Ensure UTC parsing — append Z if no timezone info present
    const created = new Date(createdAt.endsWith('Z') || createdAt.includes('+') ? createdAt : createdAt + 'Z');
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return created.toLocaleDateString();
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden cursor-pointer" onClick={onMenuClick}>
        <i className="ri-menu-line text-xl"></i>
      </button>

      <div className="h-6 w-px bg-gray-200 lg:hidden"></div>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Mobile: centered */}
        <div className="flex flex-1 items-center justify-center lg:hidden">
          <Link to="/member-dashboard" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
            <i className="ri-user-line"></i>
            Member View
          </Link>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
          {/* Desktop: in action area */}
          <Link to="/member-dashboard" className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
            <i className="ri-user-line"></i>
            Member View
          </Link>
          <div className="relative" ref={notifRef}>
            <button type="button"
              className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 cursor-pointer relative"
              onClick={() => setShowNotifications(!showNotifications)}>
              <i className="ri-notification-2-line text-xl"></i>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      className="text-xs text-blue-600 hover:text-blue-800"
                      onClick={async () => {
                        await notificationsService.markAllAsRead();
                        qc.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
                        qc.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
                      }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                {notifications.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification: any) => (
                      <div key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                        onClick={() => handleNotificationClick(notification)}>
                        <div className="flex items-start space-x-3">
                          <i className="ri-notification-line text-blue-500 mt-1"></i>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{notification.type}</p>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{getTimeAgo(notification.created_at)}</p>
                          </div>
                          {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">No notifications</div>
                )}
              </div>
            )}
          </div>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"></div>

          <div className="relative" ref={profileRef}>
            <button type="button" className="-m-1.5 flex items-center p-1.5 cursor-pointer"
              onClick={() => setShowProfile(!showProfile)}>
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name ? getInitials(user.name) : 'U'}
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-gray-900">{user?.name || 'User'}</span>
                <i className="ml-2 ri-arrow-down-s-line text-gray-400"></i>
              </span>
            </button>
            {showProfile && (
              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                <Link to="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Your Profile</Link>
                <Link to="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Settings</Link>
                <button onClick={() => { logout(); navigate('/'); }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
