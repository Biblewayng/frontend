import { useState, useEffect, useRef } from 'react';
import { livestreamService } from '@/services/livestream.service';
import { useLivestream } from '@/hooks/useLivestream';
import LivestreamWebSocket from '@/services/LivestreamWebSocket';

const EMPTY_STATS = { current_viewers: 0, peak_viewers: 0, duration: 0, chat_messages: 0 };

export function useAdminLivestream() {
  const { getStreamHistory } = useLivestream();

  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [streamStats, setStreamStats] = useState(EMPTY_STATS);
  const [streamHistory, setStreamHistory] = useState<any[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalHistoryPages, setTotalHistoryPages] = useState(1);
  const [audioLevel, setAudioLevel] = useState(0);
  const [icecastUrl, setIcecastUrl] = useState('');
  const [streamSettings, setStreamSettings] = useState({
    title: 'Sunday Morning Service - Live Audio',
    quality: 'high',
    category: 'Sunday Service',
    autoRecord: true,
    description: '',
    isPublic: true
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    livestreamService.getStreamUrl()
      .then((url) => setIcecastUrl(url))
      .catch(() => setIcecastUrl('http://localhost:8001/live'));
  }, []);

  useEffect(() => {
    loadCurrentStream();
    loadStreamHistory(historyPage);
  }, [historyPage]);

  // Single WS connection for everything
  useEffect(() => {
    LivestreamWebSocket.connect(currentStreamId);

    const unbindStats = LivestreamWebSocket.on('stats', (stats) => {
      setStreamStats(stats);
      setViewerCount(stats.current_viewers);
    });

    const unbindStarted = LivestreamWebSocket.on('stream-started', (streamId) => {
      setCurrentStreamId(streamId);
      setIsLive(true);
      setLoading(false);
    });

    const unbindEnded = LivestreamWebSocket.on('stream-ended', () => {
      setCurrentStreamId(null);
      setIsLive(false);
      setViewerCount(0);
      setStreamStats(EMPTY_STATS);
      setLoading(false);
      loadStreamHistory(1);
    });

    const unbindUpdated = LivestreamWebSocket.on('stream-updated', (data) => {
      setStreamSettings(prev => ({ ...prev, title: data.title, description: data.description }));
    });

    const unbindStatus = LivestreamWebSocket.on('stream-status', (data) => {
      if (!data.is_live) {
        setIsLive(false);
        setCurrentStreamId(null);
        setStreamStats(EMPTY_STATS);
      }
    });

    return () => {
      unbindStats();
      unbindStarted();
      unbindEnded();
      unbindUpdated();
      unbindStatus();
      // We don't necessarily want to disconnect here if other components are using it,
      // but useAdminLivestream is usually the primary owner.
      // For now, let's keep it consistent.
      LivestreamWebSocket.disconnect();
    };
  }, [currentStreamId]);

  // Audio analyser for waveform
  useEffect(() => {
    if (!isLive || !icecastUrl) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setAudioLevel(0);
      return;
    }

    let ctx: AudioContext;
    let analyser: AnalyserNode;
    let source: MediaElementAudioSourceNode;
    let cancelled = false;

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.src = icecastUrl;
    audioRef.current = audio;

    const start = async () => {
      try {
        ctx = new AudioContext();
        await ctx.resume();
        source = ctx.createMediaElementSource(audio);
        analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyser.connect(ctx.destination);
        await audio.play();
        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          if (cancelled) return;
          analyser.getByteFrequencyData(data);
          setAudioLevel(data.reduce((a, b) => a + b, 0) / data.length);
          animFrameRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch (e) {
        // autoplay blocked or stream unavailable — waveform stays flat
      }
    };

    start();

    return () => {
      cancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      audio.pause();
      audio.src = '';
      try { source?.disconnect(); analyser?.disconnect(); ctx?.close(); } catch {}
      setAudioLevel(0);
    };
  }, [isLive, icecastUrl]);

  const loadCurrentStream = async () => {
    try {
      const stream = await livestreamService.getCurrent();
      if (stream?.id) {
        setIsLive(true);
        setViewerCount(stream.viewers || 0);
        setCurrentStreamId(stream.id);
        setStreamSettings(prev => ({
          ...prev,
          title: stream.title || prev.title,
          description: stream.description || prev.description,
          isPublic: stream.is_public ?? true
        }));
      } else {
        setIsLive(false);
        setCurrentStreamId(null);
      }
    } catch {
      setIsLive(false);
      setCurrentStreamId(null);
    }
  };

  const loadStreamHistory = async (page = 1) => {
    try {
      const response = await getStreamHistory(page, 5);
      setStreamHistory(response.data || []);
      setTotalHistoryPages(response.pages ?? 1);
    } catch {}
  };

  const handleToggleLive = (live: boolean) => {
    setLoading(true);
    if (live) {
      LivestreamWebSocket.send({
        type: 'stream-start',
        title: streamSettings.title,
        description: streamSettings.description
      });
    } else if (currentStreamId) {
      LivestreamWebSocket.send({ type: 'stream-stop', streamId: currentStreamId });
    } else {
      setLoading(false);
    }
  };

  const updateMetadata = () => {
    if (!currentStreamId) return;
    LivestreamWebSocket.send({
      type: 'update-stream-title',
      streamId: currentStreamId,
      title: streamSettings.title,
      description: streamSettings.description,
      is_public: streamSettings.isPublic
    });
  };

  const toggleMute = () => {
    if (audioRef.current) audioRef.current.muted = !audioRef.current.muted;
  };

  return {
    isLive, loading, currentStreamId, viewerCount, streamStats,
    streamHistory, historyPage, setHistoryPage, totalHistoryPages,
    audioLevel, streamSettings, setStreamSettings,
    handleToggleLive, updateMetadata, toggleMute
  };
}
