import { sermonsService } from '@/services/sermons.service';

export const useSermonPlayer = () => {
  const incrementPlayCount = async (sermonId: string | number) => {
    const key = `played_${sermonId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    try {
      await sermonsService.incrementPlays(sermonId);
    } catch (error) {
      console.error('Error incrementing play count:', error);
    }
  };

  const incrementDownloadCount = async (sermonId: string | number) => {
    try {
      await sermonsService.incrementDownloads(sermonId);
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }
  };

  return { incrementPlayCount, incrementDownloadCount };
};
