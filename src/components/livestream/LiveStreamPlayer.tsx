import { useEffect, useRef, useState } from 'react';
import { formatDuration, elapsedSeconds } from '@/utils/date';
import { useLivestreamPlayerContext } from '@/context/LivestreamPlayerContext';

interface Props {
  isLive: boolean;
  title?: string;
  description?: string;
  startTime?: string;
}

export default function LiveStreamPlayer({ isLive, title, description, startTime }: Props) {
  const { isPlaying, isMuted, volume, setIsMuted, setVolume, handlePlay } = useLivestreamPlayerContext();
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLive || !startTime) return;
    const update = () => setElapsed(elapsedSeconds(startTime!));
    update();
    timerRef.current = window.setInterval(update, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isLive, startTime]);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 flex items-center justify-center relative min-h-48">
        {isLive ? (
          <>
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                LIVE
              </div>
              {startTime && (
                <span className="text-white/70 text-sm font-mono">{formatDuration(elapsed)}</span>
              )}
            </div>
            <div className="text-white text-center">
              <p className="text-2xl font-bold mb-2">{title || 'Live Audio Stream'}</p>
              {description && <p className="text-base text-blue-100 max-w-2xl mx-auto mb-4">{description}</p>}
              <div className="flex items-center justify-center space-x-1">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className={`w-1 h-5 rounded-full transition-all duration-75 ${
                    isPlaying && !isMuted ? i < 14 ? 'bg-green-400' : i < 19 ? 'bg-yellow-400' : 'bg-red-400' : 'bg-white/30'
                  }`} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-blue-100 text-center">
            <i className="ri-radio-line text-6xl mb-4"></i>
            <p className="text-xl">No Live Stream</p>
            <p className="text-sm mt-2">Check back during service times</p>
          </div>
        )}
      </div>

      {isLive && (
        <div className="p-4 flex items-center gap-4 border-t">
          <button onClick={handlePlay} className="text-blue-600 hover:text-blue-800">
            <i className={`${isPlaying ? 'ri-pause-fill' : 'ri-play-fill'} text-2xl`}></i>
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className="text-gray-600 hover:text-gray-800">
            <i className={`${isMuted ? 'ri-volume-mute-fill' : 'ri-volume-up-fill'} text-2xl`}></i>
          </button>
          <input type="range" min="0" max="100" value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))} className="flex-1" />
          <span className="text-sm text-gray-600">{isMuted ? 0 : volume}%</span>
        </div>
      )}
    </div>
  );
}
