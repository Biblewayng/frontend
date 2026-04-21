import { lazy, Suspense, useEffect, useState } from 'react';
import { livestreamService } from '@/services/livestream.service';
import StreamStats from '@/pages/live/StreamStats';

const LiveStreamPlayer = lazy(() => import('@/components/livestream/LiveStreamPlayer'));
const LiveStreamComments = lazy(() => import('@/pages/live/LiveStreamComments'));

const EMPTY_STATS = { current_viewers: 0, peak_viewers: 0, duration: 0, chat_messages: 0 };

interface Props {
  currentStream: any;
}

export default function PastorLivestream({ currentStream }: Props) {
  const [stats, setStats] = useState(EMPTY_STATS);
  const isLive = currentStream?.is_live || false;

  useEffect(() => {
    if (!currentStream?.id || !isLive) return;
    const load = () =>
      livestreamService.getStats(currentStream.id)
        .then((s: any) => setStats(s))
        .catch(() => {});
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [currentStream?.id, isLive]);

  return (
    <div className="space-y-6">
      <StreamStats isLive={isLive} stats={stats} />
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-48 rounded-lg" />}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <LiveStreamPlayer
              isLive={isLive}
              title={currentStream?.title}
              description={currentStream?.description}
              startTime={currentStream?.start_time}
            />
          </div>
          <div>
            <LiveStreamComments streamId={currentStream?.id ?? null} isLive={isLive} showDeleteButton={false} />
          </div>
        </div>
      </Suspense>
    </div>
  );
}
