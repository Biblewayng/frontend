import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatDuration, elapsedSeconds } from '@/utils/date';
import { useLivestream } from '@/hooks/useLivestream';
import { useLivestreamPlayer } from '@/hooks/useLivestreamPlayer';
import { livestreamService } from '@/services/livestream.service';
import LivestreamWebSocket from '@/services/LivestreamWebSocket';

const ADJECTIVES = ['Happy', 'Blessed', 'Joyful', 'Peaceful', 'Graceful', 'Faithful', 'Gentle', 'Humble', 'Radiant', 'Serene'];
const NOUNS = ['Visitor', 'Listener', 'Guest', 'Soul', 'Pilgrim', 'Seeker', 'Worshipper', 'Friend', 'Believer', 'Wanderer'];

function getGuestName(): string {
  const key = 'guest_listener_name';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const name = `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]} ${NOUNS[Math.floor(Math.random() * NOUNS.length)]}`;
  localStorage.setItem(key, name);
  return name;
}


export default function PublicLivestreamPlayer() {
  const { getPublicCurrent } = useLivestream();
  const [stream, setStream] = useState<any>(null);
  const [status, setStatus] = useState<{ is_live: boolean; is_public: boolean } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  const loadStream = async () => {
    try {
      const [s, st] = await Promise.all([
        getPublicCurrent(),
        livestreamService.getPublicStatus(),
      ]);
      setStream(s?.id ? s : null);
      setStatus(st);
    } catch { setStream(null); setStatus(null); }
  };

  useEffect(() => {
    loadStream();
    LivestreamWebSocket.connect(null);
    const unbind = LivestreamWebSocket.on('stream-status', () => loadStream());
    return () => { unbind(); LivestreamWebSocket.disconnect(); };
  }, []);

  const isLive = stream?.is_live ?? false;
  const guestName = getGuestName();
  const { audioRef, volume, setVolume, isMuted, setIsMuted, isPlaying, audioLevel, handlePlay } =
    useLivestreamPlayer(stream?.id, isLive, guestName, stream?.stream_url);

  // Tick from stream start_time
  useEffect(() => {
    if (!stream?.start_time) return;
    const update = () => setElapsed(elapsedSeconds(stream.start_time));
    update();
    timerRef.current = window.setInterval(update, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stream?.start_time]);

  if (!isLive && !status?.is_live) return null;

  if (status?.is_live && !status?.is_public) {
    const isAuthenticated = !!guestName && localStorage.getItem('token');
    
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl p-6 text-center space-y-3">
          <span className="flex items-center justify-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full w-fit mx-auto">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            LIVE
          </span>
          <p className="text-white font-bold text-lg">Service ongoing</p>
          <Link
            to={isAuthenticated ? "/member-dashboard?tab=livestream" : "/signup"}
            className="inline-block bg-white text-blue-700 font-semibold text-sm px-5 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            {isAuthenticated ? "Join now" : "Sign up to join"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <audio ref={audioRef} className="hidden" />

      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl overflow-hidden">
        {/* Live badge + title */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            LIVE
          </span>
          <span className="text-white font-semibold text-sm truncate">{stream.title || 'Live Audio Stream'}</span>
        </div>

        {/* Main area: play button center + volume slider right */}
        <div className="flex items-center justify-between px-5 py-3">
          {/* Spacer left */}
          <div className="w-12" />

          {/* Center play button */}
          <button
            onClick={handlePlay}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <i className={`${isPlaying ? 'ri-stop-fill' : 'ri-play-fill'} text-blue-700 text-4xl ${!isPlaying ? 'ml-1' : ''}`}></i>
          </button>

          {/* Vertical volume slider right */}
          <div className="flex flex-col items-center gap-1 w-12">
            <button onClick={() => setIsMuted(!isMuted)} className="text-white/70 hover:text-white transition-colors">
              <i className={`${isMuted || volume === 0 ? 'ri-volume-mute-line' : volume < 50 ? 'ri-volume-down-line' : 'ri-volume-up-line'} text-lg`}></i>
            </button>
            <input
              type="range" min="0" max="100" value={isMuted ? 0 : volume}
              onChange={(e) => { setVolume(Number(e.target.value)); if (isMuted) setIsMuted(false); }}
              className="h-16 cursor-pointer accent-white"
              style={{ writingMode: 'vertical-lr', direction: 'rtl', appearance: 'slider-vertical' } as any}
            />
            <span className="text-white/50 text-xs">{isMuted ? 0 : volume}%</span>
          </div>
        </div>

        {/* Waveform + elapsed time at bottom */}
        <div className="flex items-end gap-2 px-5 pb-3">
          <span className="text-white/60 text-xs font-mono shrink-0 mb-0.5">
            {isPlaying ? formatDuration(elapsed) : '--:--'}
          </span>
          <div className="flex items-end flex-1 justify-center gap-0.5 h-7">
            {[...Array(40)].map((_, i) => {
              const active = isPlaying && !isMuted && audioLevel > (i + 1) * 2.5;
              const height = active
                ? `${10 + Math.sin(i * 0.8) * 8 + (audioLevel / 12)}px`
                : '3px';
              return (
                <div key={i} style={{ height }}
                  className={`w-1 rounded-full transition-all duration-75 ${
                    active
                      ? i < 24 ? 'bg-green-400' : i < 34 ? 'bg-yellow-400' : 'bg-red-400'
                      : 'bg-white/20'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
