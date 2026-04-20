import { useMemberDashboard } from '@/hooks/useMemberDashboard';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/date';

interface Props {
  onPlaySermon: (sermon: any) => void;
}

export default function MemberOverview({ onPlaySermon }: Props) {
  const { user } = useAuth();
  const { stats, recentSermons, upcomingEvents, loading } = useMemberDashboard(user?.id || '');

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {[
          { label: 'Total Downloaded Sermons', value: `${stats.downloadedSermons} Sermons`, icon: 'ri-download-cloud-line', color: 'blue' },
          { label: 'Events Attended', value: `${stats.eventsAttended} Events`, icon: 'ri-group-line', color: 'purple' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`bg-${color}-50 rounded-lg p-6 flex items-center`}>
            <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
              <i className={`${icon} text-${color}-600 text-xl`}></i>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium text-${color}-600`}>{label}</p>
              <p className={`text-2xl font-bold text-${color}-900`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sermons</h3>
          <div className="space-y-4">
            {recentSermons.length > 0 ? recentSermons.map((sermon: any) => (
              <div key={sermon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{sermon.title}</p>
                  <p className="text-sm text-gray-500">{formatDate(sermon.date)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {sermon.duration && <span className="text-xs text-gray-500 hidden sm:inline">{sermon.duration}</span>}
                  <button onClick={() => onPlaySermon(sermon)} className="text-blue-600 hover:text-blue-800 cursor-pointer">
                    <i className="ri-play-line"></i>
                  </button>
                </div>
              </div>
            )) : <p className="text-gray-500 text-center py-4">No recent sermons</p>}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
          <div className="space-y-4">
            {upcomingEvents.length > 0 ? upcomingEvents.map((event: any) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                </div>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{event.type}</span>
              </div>
            )) : <p className="text-gray-500 text-center py-4">No upcoming events</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
