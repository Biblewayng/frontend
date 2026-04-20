import { useState, useEffect, useRef } from 'react';
import { Sermon } from '@/types';
import { getMediaUrl } from '@/services/api';
import { useSermonPlayer } from '@/hooks/useSermonPlayer';
import { formatTime } from '@/utils/time';

interface PlaylistPlayerProps {
  sermons: Sermon[];
  onClose: () => void;
}

export default function PlaylistPlayer({ sermons, onClose }: PlaylistPlayerProps) {
  const { incrementPlayCount } = useSermonPlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [hasEnded, setHasEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<number | null>(null);

  const sermon = sermons[currentIndex];

  useEffect(() => {
    if (sermon && audioRef.current) {
      const audio = audioRef.current;
      audio.src = getMediaUrl(sermon.audio_url) || '';
      
      const savedPosition = localStorage.getItem(`sermon_${sermon.id}_position`);
      
      const handleLoadedMetadata = () => {
        if (savedPosition) {
          audio.currentTime = parseFloat(savedPosition);
        }
        audio.play();
        setIsPlaying(true);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
      
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.load();
      if (sermon.id) {
        incrementPlayCount(sermon.id);
      }
    }
  }, [sermon, currentIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      if (sermon) {
        localStorage.setItem(`sermon_${sermon.id}_position`, audio.currentTime.toString());
      }
    };
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setHasEnded(true);
      if (sermon) {
        localStorage.removeItem(`sermon_${sermon.id}_position`);
      }
      // Auto-play next sermon
      if (currentIndex < sermons.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setHasEnded(false);
      }
    };
    const handleError = () => {
      setIsPlaying(false);
      setError('Connection lost. Trying to reconnect...');
      retryWithBackoff();
    };
    const handleStalled = () => {
      setError('Connection lost. Trying to reconnect...');
    };
    const handleCanPlay = () => {
      setError(null);
      setRetryCount(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('canplay', handleCanPlay);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [sermon, currentIndex, sermons.length]);

  const playNext = () => {
    if (currentIndex < sermons.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setHasEnded(false);
    }
  };

  const playPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setHasEnded(false);
    }
  };

  const retryWithBackoff = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
    retryTimeoutRef.current = window.setTimeout(() => {
      if (audioRef.current && sermon) {
        const currentPos = audioRef.current.currentTime;
        audioRef.current.load();
        audioRef.current.currentTime = currentPos;
        audioRef.current.play().then(() => {
          setError(null);
          setIsPlaying(true);
          setRetryCount(0);
        }).catch(() => {
          setRetryCount(prev => prev + 1);
          if (retryCount < 5) {
            retryWithBackoff();
          } else {
            setError('Unable to reconnect. Please check your connection.');
          }
        });
      }
    }, delay);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (hasEnded) {
        audioRef.current.currentTime = 0;
        setHasEnded(false);
      }
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && sermon) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, hasEnded, sermon]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setVolume(vol);
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  if (!sermon) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <audio ref={audioRef} />
      <div className="max-w-7xl mx-auto px-3 py-2 sm:px-4 sm:py-3">
        {error && (
          <div className="mb-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
            <span className="text-xs text-yellow-800 flex items-center gap-1">
              <i className="ri-error-warning-line text-yellow-600"></i>{error}
            </span>
            {retryCount > 0 && retryCount < 5 && <span className="text-xs text-yellow-600">Retry {retryCount}/5</span>}
          </div>
        )}

        {/* Title row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {sermon.thumbnail_url ? (
              <img src={getMediaUrl(sermon.thumbnail_url) || ''} alt={sermon.title} className="w-9 h-9 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {sermon.title.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{sermon.title}</h4>
              <p className="text-xs text-gray-500 truncate">{sermon.speaker} • {currentIndex + 1}/{sermons.length}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 flex-shrink-0">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Seek bar */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500 w-8 text-right flex-shrink-0">{formatTime(currentTime)}</span>
          <input type="range" min="0" max={duration || 0} value={currentTime} onChange={handleSeek}
            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(currentTime / (duration || 1)) * 100}%, #E5E7EB ${(currentTime / (duration || 1)) * 100}%, #E5E7EB 100%)` }} />
          <span className="text-xs text-gray-500 w-8 flex-shrink-0">{formatTime(duration)}</span>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-2">
            <i className="ri-volume-up-line text-gray-600 text-sm"></i>
            <input type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div className="flex items-center gap-1 sm:gap-2 mx-auto">
            <button onClick={playPrevious} disabled={currentIndex === 0} className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed">
              <i className="ri-skip-back-fill text-lg sm:text-xl"></i>
            </button>
            <button onClick={() => skip(-10)} className="p-1.5 text-gray-600 hover:text-gray-900">
              <i className="ri-replay-10-line text-lg sm:text-xl"></i>
            </button>
            <button onClick={togglePlay} className="p-2 sm:p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700">
              <i className={`${hasEnded ? 'ri-restart-line' : isPlaying ? 'ri-pause-fill' : 'ri-play-fill'} text-lg sm:text-xl`}></i>
            </button>
            <button onClick={() => skip(10)} className="p-1.5 text-gray-600 hover:text-gray-900">
              <i className="ri-forward-10-line text-lg sm:text-xl"></i>
            </button>
            <button onClick={playNext} disabled={currentIndex === sermons.length - 1} className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed">
              <i className="ri-skip-forward-fill text-lg sm:text-xl"></i>
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-2 invisible">
            <i className="ri-volume-up-line text-gray-600 text-sm"></i>
            <input type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
}
