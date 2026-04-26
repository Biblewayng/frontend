import { lazy, Suspense, useEffect, useState } from 'react';
import LivestreamWebSocket from '@/services/LivestreamWebSocket';
import { LivestreamPlayerProvider } from '@/context/LivestreamPlayerContext';
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
    const unbind = LivestreamWebSocket.on('stats', (data: any) => {
      setStats(prev => ({
        current_viewers: data.current_viewers ?? prev.current_viewers,
        peak_viewers: data.peak_viewers ?? prev.peak_viewers,
        duration: data.duration ?? prev.duration,
        chat_messages: data.chat_messages ?? prev.chat_messages,
      }));
    });
    return () => unbind();
  }, []);

  return (
    <LivestreamPlayerProvider streamId={currentStream?.id} streamUrl={currentStream?.stream_url} isLive={isLive}>
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
    </LivestreamPlayerProvider>
  );
}
