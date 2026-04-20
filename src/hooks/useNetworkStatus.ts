import { useEffect, useState } from 'react';

type NetworkStatus = 'online' | 'offline' | 'slow' | 'restored';

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>(() => {
    if (!navigator.onLine) return 'offline';
    const conn = (navigator as any).connection;
    if (conn && (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' || conn.downlink < 1)) return 'slow';
    return 'online';
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const handleOffline = () => {
      clearTimeout(timer);
      setStatus('offline');
    };

    const handleOnline = () => {
      clearTimeout(timer);
      setStatus('restored');
      timer = setTimeout(() => setStatus('online'), 5000);
    };

    const handleChange = () => {
      if (!navigator.onLine) return;
      const conn = (navigator as any).connection;
      if (conn && (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' || conn.downlink < 1)) {
        setStatus('slow');
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    const conn = (navigator as any).connection;
    conn?.addEventListener('change', handleChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      conn?.removeEventListener('change', handleChange);
    };
  }, []);

  return status;
}
