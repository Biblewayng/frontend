interface LiveStreamInfoProps {
  isLive: boolean;
}

export default function LiveStreamInfo({ isLive }: LiveStreamInfoProps) {
return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Stream Information</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isLive ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
          }`}>
            {isLive ? 'Live Now' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
}
