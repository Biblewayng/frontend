
import { formatTime as formatDuration } from '@/utils/time';

interface StreamStatsProps {
  isLive: boolean;
  stats: {
    current_viewers: number;
    peak_viewers: number;
    duration: number;
    chat_messages: number;
  };
}

export default function StreamStats({ isLive, stats: streamStats }: StreamStatsProps) {

  const stats = [
    {
      name: 'Current Viewers',
      value: streamStats.current_viewers.toString(),
      change: isLive ? 'Live now' : 'Offline',
      changeType: isLive ? 'live' : 'offline',
      icon: 'ri-eye-line'
    },
    {
      name: 'Duration',
      value: formatDuration(streamStats.duration),
      change: '',
      changeType: isLive ? 'live' : 'offline',
      icon: 'ri-time-line'
    },
    {
      name: 'Chat Messages',
      value: streamStats.chat_messages.toString(),
      change: '',
      changeType: 'offline',
      icon: 'ri-chat-3-line'
    }
  ];

  const iconColors = [
    { gradient: 'from-red-500 to-red-600' },
    { gradient: 'from-purple-500 to-purple-600' },
    { gradient: 'from-green-500 to-green-600' }
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((item, index) => (
        <div key={item.name} className="relative bg-gradient-to-br from-white to-gray-50 overflow-hidden shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-100/30 to-transparent rounded-full -mr-12 -mt-12"></div>
          <div className="relative p-4">
            <div className="flex items-start justify-between">
              <div className={`w-11 h-11 flex items-center justify-center bg-gradient-to-br ${iconColors[index].gradient} rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200`}>
                <i className={`${item.icon} text-white text-lg`}></i>
              </div>
              {item.changeType === 'live' && (
                <div className="flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1.5 animate-pulse"></div>
                  Live
                </div>
              )}
            </div>
            <div className="mt-2.5">
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
