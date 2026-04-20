import { useState, useEffect, useRef } from 'react';
import { Sermon } from '@/types';
import { getMediaUrl } from '@/services/api';
import { useSermonPlayer } from '@/hooks/useSermonPlayer';
import { formatTime } from '@/utils/time';

interface PlaylistMusicPlayerProps {
  sermons: Sermon[];
  onClose: () => void;
}

export default function PlaylistMusicPlayer({ sermons, onClose }: PlaylistMusicPlayerProps) {
  const { incrementPlayCount } = useSermonPlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const currentSermon = sermons[currentIndex];

  useEffect(() => {
    if (currentSermon && audioRef.current) {
      const audio = audioRef.current;
      audio.src = getMediaUrl(currentSermon.audio_url) || '';
      
      const savedPosition = localStorage.getItem(`sermon_${currentSermon.id}_position`);
      
      const handleLoadedMetadata = () => {
        if (savedPosition) {
          audio.currentTime = parseFloat(savedPosition);
        }
        audio.play().catch(err => console.error('Play error:', err));
        setIsPlaying(true);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
      
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.load();
      
      if (currentSermon.id) {
        incrementPlayCount(currentSermon.id);
      }
    }
  }, [currentIndex, currentSermon]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      if (currentSermon) {
        localStorage.setItem(`sermon_${currentSermon.id}_position`, audio.currentTime.toString());
      }
    };
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (currentSermon) {
        localStorage.removeItem(`sermon_${currentSermon.id}_position`);
      }
      if (currentIndex < sermons.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, sermons.length]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

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

  const playNext = () => {
    if (currentIndex < sermons.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentTime(0);
    }
  };

  const playPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentTime(0);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  if (!currentSermon) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <audio ref={audioRef} />
      <div className="max-w-7xl mx-auto px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4 flex-1">
            <img 
              src={getMediaUrl(currentSermon.thumbnail_url) || `https://readdy.ai/api/search-image?query=sermon&width=100&height=100&seq=${currentSermon.id}`}
              alt={currentSermon.title}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">{currentSermon.title}</h4>
              <p className="text-xs text-gray-500 truncate">{currentSermon.speaker}</p>
              <p className="text-xs text-gray-400">
                {currentIndex + 1} of {sermons.length}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <i className="ri-close-line text-xl"></i>
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
            <button onClick={playPrevious} disabled={currentIndex === 0}
              className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed">
              <i className="ri-skip-back-fill text-lg sm:text-xl"></i>
            </button>
            <button onClick={() => skip(-10)} className="p-1.5 text-gray-600 hover:text-gray-900">
              <i className="ri-replay-10-line text-lg sm:text-xl"></i>
            </button>
            <button onClick={togglePlay} className="p-2 sm:p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700">
              <i className={`${isPlaying ? 'ri-pause-fill' : 'ri-play-fill'} text-lg sm:text-xl`}></i>
            </button>
            <button onClick={() => skip(10)} className="p-1.5 text-gray-600 hover:text-gray-900">
              <i className="ri-forward-10-line text-lg sm:text-xl"></i>
            </button>
            <button onClick={playNext} disabled={currentIndex === sermons.length - 1}
              className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed">
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
