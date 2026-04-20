const BASE_URL = (import.meta.env.VITE_API_URL as string || '').replace('/api', '');

export const getMediaUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
};

export const downloadFile = async (url: string, filename: string): Promise<void> => {
  const response = await fetch(url);
  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href: objectUrl, download: filename });
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(objectUrl);
};

export const downloadSermon = async (audioUrl: string, title: string): Promise<void> => {
  const url = getMediaUrl(audioUrl);
  if (!url) throw new Error('Audio file not available');
  await downloadFile(url, `${title}.mp3`);
};
