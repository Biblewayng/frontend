import { lazy, Suspense } from 'react';

const LiveStreamPlayer = lazy(() => import('@/components/livestream/LiveStreamPlayer'));
const LiveStreamChat = lazy(() => import('@/pages/live/LiveStreamComments'));

const LoadingSpinner = () => <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;

interface Props {
  currentStream: any;
  loadingStream: boolean;
}

export default function MemberLivestream({ currentStream, loadingStream }: Props) {
  if (loadingStream) return <div className="text-center py-12">Loading stream...</div>;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <LiveStreamPlayer
            isLive={currentStream?.is_live || false}
            title={currentStream?.title}
            description={currentStream?.description}
            startTime={currentStream?.start_time}
          />
        </div>
        <div>
          <LiveStreamChat streamId={currentStream?.id} isLive={currentStream?.is_live || false} showDeleteButton={false} />
        </div>
      </div>
    </Suspense>
  );
}
