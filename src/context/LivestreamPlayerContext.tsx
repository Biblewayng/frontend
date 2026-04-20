import { createContext, useContext, useRef, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import { useLivestream } from '@/hooks/useLivestream';
import { useAuth } from '@/context/AuthContext';
import LivestreamWebSocket from '@/services/LivestreamWebSocket';

function getGuestId(): string {
  const key = 'guest_viewer_id';
  let id = localStorage.getItem(key);
  if (!id) { id = `guest_${crypto.randomUUID()}`; localStorage.setItem(key, id); }
  return id;
}

interface LivestreamPlayerContextType {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  setIsMuted: (v: boolean) => void;
  setVolume: (v: number) => void;
  handlePlay: () => Promise<void>;
}

const LivestreamPlayerContext = createContext<LivestreamPlayerContextType | null>(null);

export function LivestreamPlayerProvider({ streamId, streamUrl, children }: {
  streamId?: string;
  streamUrl?: string;
  isLive?: boolean;
  children: ReactNode;
}) {
  const { addViewer } = useLivestream();
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const hasJoinedRef = useRef(false);

  const handlePlay = useCallback(async () => {
    const next = !isPlaying;

    if (next && !hasJoinedRef.current && streamId) {
      try {
        const name = user?.name || user?.email || 'Anonymous';
        const viewerUserId = user?.id ?? getGuestId();
        const result = await addViewer(streamId, { name, location: 'Online', user_id: viewerUserId });
        hasJoinedRef.current = true;
        if (result?.id) (window as any).currentViewerId = result.id;
      } catch (e: any) {
        const detail = e?.response?.data?.detail;
        const msg = (typeof detail === 'object' ? detail?.error : detail) || e?.message || '';
        toast.error(msg.toLowerCase().includes('banned')
          ? 'You are banned from this stream.'
          : 'Could not join the stream.', { position: 'top-center' });
        return;
      }
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (next) {
      if (!audio.src || audio.src === window.location.href) {
        audio.src = streamUrl || '';
        audio.load();
      }
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (e: any) {
        if (e.name !== 'AbortError') toast.error('Audio playback failed.');
      }
    } else {
      audio.pause();
      setIsPlaying(false);
      if (hasJoinedRef.current && streamId) {
        const viewerId = (window as any).currentViewerId;
        if (viewerId) {
          LivestreamWebSocket.send({ type: 'viewer-leave', viewerId, streamId });
          hasJoinedRef.current = false;
          delete (window as any).currentViewerId;
        }
      }
    }
  }, [isPlaying, streamId, streamUrl, user, addViewer]);

  // Sync volume/mute to audio element
  if (audioRef.current) {
    audioRef.current.volume = isMuted ? 0 : volume / 100;
  }

  return (
    <LivestreamPlayerContext.Provider value={{ audioRef, isPlaying, isMuted, volume, setIsMuted, setVolume, handlePlay }}>
      <audio ref={audioRef} className="hidden" />
      {children}
    </LivestreamPlayerContext.Provider>
  );
}

export function useLivestreamPlayerContext() {
  const ctx = useContext(LivestreamPlayerContext);
  if (!ctx) throw new Error('useLivestreamPlayerContext must be used within LivestreamPlayerProvider');
  return ctx;
}
