import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { livestreamService } from '@/services/livestream.service';
import { useLivestream } from '@/hooks/useLivestream';
import { useAuth } from '@/context/AuthContext';
import LivestreamWebSocket from '@/services/LivestreamWebSocket';

function getGuestId(): string {
  const key = 'guest_viewer_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `guest_${crypto.randomUUID()}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export function useLivestreamPlayer(streamId: string | undefined, isLive: boolean, guestName?: string, streamUrl?: string) {
  const { addViewer } = useLivestream();
  const { user } = useAuth();
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [icecastUrl, setIcecastUrl] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (streamUrl) { console.log('[Player] streamUrl from prop:', streamUrl); setIcecastUrl(streamUrl); return; }
    livestreamService.getStreamUrl()
      .then((url) => { console.log('[Player] streamUrl from service:', url); setIcecastUrl(url); })
      .catch(() => setIcecastUrl('http://localhost:8001/live'));
  }, [streamUrl]);

  const prevSrcRef = useRef<string>('');

  useEffect(() => {
    if (isLive && streamId && audioRef.current && icecastUrl && icecastUrl !== prevSrcRef.current) {
      prevSrcRef.current = icecastUrl;
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.src = icecastUrl;
      audioRef.current.load();
    }
  }, [isLive, streamId, icecastUrl]);

  // Waveform — only when live & playing
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    if (!isPlaying || !isLive || !audioRef.current) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setAudioLevel(0);
      return;
    }

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // MediaElementSource can only be created once per element
      if (!sourceRef.current) {
        sourceRef.current = ctx.createMediaElementSource(audioRef.current);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        sourceRef.current.connect(analyser);
        analyser.connect(ctx.destination);
        (audioRef.current as any)._analyser = analyser;
      }

      const analyser = (audioRef.current as any)._analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      
      const tick = () => {
        if (!isPlaying) return;
        analyser.getByteFrequencyData(data);
        const average = data.reduce((a, b) => a + b, 0) / data.length;
        setAudioLevel(average);
        animFrameRef.current = requestAnimationFrame(tick);
      };
      
      tick();
    } catch (err) {
      console.error('[Player] Web Audio API error:', err);
    }

    return () => { 
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); 
    };
  }, [isPlaying, isLive]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isPlaying) return;
    const handleError = () => {
      reconnectTimeoutRef.current = setTimeout(() => {
        if (audio && isPlaying) { audio.load(); audio.play().catch(console.error); }
      }, 3000);
    };
    const handleStalled = () => {
      if (audio && isPlaying) { audio.load(); audio.play().catch(console.error); }
    };
    audio.addEventListener('error', handleError);
    audio.addEventListener('stalled', handleStalled);
    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('stalled', handleStalled);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  // WS Connection & Kicked listener
  useEffect(() => {
    if (!streamId || !isLive) return;

    // If we were joined as a different identity, leave first
    if (hasJoined) {
      const viewerId = (window as any).currentViewerId;
      if (viewerId) {
        LivestreamWebSocket.send({ type: 'viewer-leave', viewerId, streamId });
      }
      setHasJoined(false);
      delete (window as any).currentViewerId;
    }

    LivestreamWebSocket.connect(streamId);

    const myId = user?.id ?? getGuestId();
    const unbindKicked = LivestreamWebSocket.on('viewer-kicked', (data) => {
      if (data.userId === myId) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current.load();
        }
        setIsPlaying(false);
        setHasJoined(false);
        delete (window as any).currentViewerId;
        toast.error('You have been removed from this stream by the host.', {
          duration: 5000,
          position: 'top-center'
        });
      }
    });

    const unbindBanned = LivestreamWebSocket.on('viewer-banned', (data) => {
      if (data.userId === myId) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current.load();
        }
        setIsPlaying(false);
        setHasJoined(false);
        delete (window as any).currentViewerId;
        toast.error('You have been banned from this stream.', {
          duration: 8000,
          position: 'top-center'
        });
      }
    });

    return () => {
      unbindKicked();
      unbindBanned();
      LivestreamWebSocket.disconnect();
    };
  }, [streamId, isLive, user]);

  useEffect(() => {
    const handleOnline = () => {
      if (isPlaying && audioRef.current) { audioRef.current.load(); audioRef.current.play().catch(console.error); }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [isPlaying]);

  const handlePlay = async () => {
    const next = !isPlaying;
    if (next && !hasJoined && streamId) {
      try {
        const name = guestName || user?.name || user?.email || 'Anonymous';
        const viewerUserId = user?.id ?? getGuestId();
        const result = await addViewer(streamId, { name, location: 'Online', user_id: viewerUserId });
        setHasJoined(true);
        if (result?.id) (window as any).currentViewerId = result.id;
      } catch (e: any) {
        const detail = e?.response?.data?.detail;
        const msg = (typeof detail === 'object' ? detail?.error : detail) || e?.message || '';
        if (msg.toLowerCase().includes('banned')) {
          toast.error('You are banned from this stream.', { position: 'top-center', duration: 8000 });
        } else {
          toast.error('Could not join the stream. Please try again.', { position: 'top-center' });
        }
        return;
      }
    }
    setIsPlaying(next);
    if (audioRef.current) {
      if (next) {
        try {
          if (!audioRef.current.src || audioRef.current.src === window.location.href) {
            audioRef.current.src = icecastUrl;
            audioRef.current.load();
          }
          await audioRef.current.play();
        } catch (error: any) {
          if (error.name === 'AbortError') return; // interrupted by load — not a real error
          console.error('[Player] play() failed:', error.name, error.message);
          toast.error(`Audio error: ${error.name} - ${error.message}`);
          setIsPlaying(false);
        }
      } else {
        audioRef.current.pause();
        if (hasJoined && streamId) {
          const viewerId = (window as any).currentViewerId;
          if (viewerId) {
            LivestreamWebSocket.send({ type: 'viewer-leave', viewerId, streamId });
            setHasJoined(false);
            delete (window as any).currentViewerId;
          }
        }
      }
    }
  };

  return { audioRef, volume, setVolume, isMuted, setIsMuted, isPlaying, audioLevel, handlePlay };
}
