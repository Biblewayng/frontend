import { useEffect, useState } from 'react';

type NetworkStatus = 'online' | 'offline' | 'slow' | 'restored';

const PING_URL = '/health';
const PING_INTERVAL = 30000;
const SLOW_THRESHOLD = 3000;

async function ping(): Promise<'online' | 'slow'> {
  const start = Date.now();
  try {
    await fetch(PING_URL, { method: 'HEAD', cache: 'no-store' });
    return Date.now() - start > SLOW_THRESHOLD ? 'slow' : 'online';
  } catch {
    return 'slow';
  }
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>('online');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let pingInterval: ReturnType<typeof setInterval>;

    const handleOffline = () => {
      clearTimeout(timer);
      setStatus('offline');
    };

    const handleOnline = () => {
      clearTimeout(timer);
      setStatus('restored');
      timer = setTimeout(() => setStatus('online'), 5000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Initial ping after 2s to avoid false positive during page load
    const initialTimer = setTimeout(async () => {
      if (!navigator.onLine) return;
      const result = await ping();
      setStatus(result);

      // Then ping every 30s
      pingInterval = setInterval(async () => {
        if (!navigator.onLine) return;
        const result = await ping();
        // Only update if currently online/slow (don't override offline/restored states)
        setStatus(prev => (prev === 'offline' || prev === 'restored') ? prev : result);
      }, PING_INTERVAL);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(initialTimer);
      clearInterval(pingInterval);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return status;
}
