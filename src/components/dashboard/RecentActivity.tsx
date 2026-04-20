import { useEffect, useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { RecentActivity as Activity } from '@/types';

const getActivityIcon = (type: string) => {
  const icons: Record<string, { icon: string; color: string }> = {
    sermon: { icon: 'ri-upload-line', color: 'text-green-600' },
    event: { icon: 'ri-calendar-line', color: 'text-blue-600' },
    announcement: { icon: 'ri-megaphone-line', color: 'text-orange-600' },
    member: { icon: 'ri-user-add-line', color: 'text-purple-600' },
    default: { icon: 'ri-information-line', color: 'text-gray-600' }
  };
  return icons[type] || icons.default;
};

export default function RecentActivity() {
  const { getRecentActivity } = useDashboard();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await getRecentActivity();
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
        <p className="mt-1 text-sm text-gray-500">
          Latest updates and interactions
        </p>
      </div>
      {loading ? (
        <div className="px-6 py-8 text-center text-gray-500">Loading...</div>
      ) : activities.length === 0 ? (
        <div className="px-6 py-8 text-center text-gray-500">No recent activity</div>
      ) : (
        <div className="flow-root">
          <ul className="divide-y divide-gray-200">
            {activities.map((activity, index) => {
              const { icon, color } = getActivityIcon(activity.type);
              const title = (activity as any).title || (activity as any).description || 'Activity';
              const timestamp = (activity as any).timestamp || (activity as any).date;
              
              let description = '';
              switch (activity.type) {
                case 'sermon':
                  description = `New sermon "${title}" uploaded`;
                  break;
                case 'event':
                  description = `New event "${title}" created`;
                  break;
                case 'announcement':
                  description = `New announcement "${title}" posted`;
                  break;
                case 'member':
                  description = `New member "${title}" joined`;
                  break;
                default:
                  description = title;
              }
              
              return (
                <li key={(activity as any).id || index} className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                        <i className={`${icon} ${color} text-sm`}></i>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900">{description}</p>
                      <p className="text-sm text-gray-500">{new Date(timestamp).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {activities.length > 0 && (
        <div className="px-6 py-3 bg-gray-50">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer whitespace-nowrap">
            View all activity
            <i className="ml-1 ri-arrow-right-line"></i>
          </button>
        </div>
      )}
    </div>
  );
}
