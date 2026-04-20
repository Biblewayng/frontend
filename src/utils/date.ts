/** Ensure a UTC ISO string is parsed as UTC (appends Z if missing). */
const toUTC = (ts: string) => (ts.endsWith('Z') || ts.includes('+') ? ts : ts + 'Z');

/** Format seconds into h:mm:ss or m:ss (audio/video duration). */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Format a UTC timestamp as a locale date string (e.g. "20/04/2026"). */
export function formatDate(ts: string): string {
  return new Date(toUTC(ts)).toLocaleDateString();
}

/** Format a UTC timestamp as a locale date + time string (e.g. "20/04/2026, 08:30:00"). */
export function formatDateTime(ts: string): string {
  return new Date(toUTC(ts)).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}

/** Format a UTC timestamp as a locale time string (e.g. "8:30 AM"). */
export function formatTime(ts: string): string {
  return new Date(toUTC(ts)).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

/** Format a UTC timestamp as a relative "time ago" string (e.g. "2 hours ago"). */
export function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(toUTC(ts)).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(ts);
}

/** Elapsed seconds between a UTC start_time string and now. */
export function elapsedSeconds(startTime: string): number {
  return Math.floor((Date.now() - new Date(toUTC(startTime)).getTime()) / 1000);
}
