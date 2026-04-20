import { useEffect, useState } from 'react';

type NetworkStatus = 'online' | 'offline' | 'slow' | 'restored';

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>('online');

  useEffect(() => {
    const getStatus = (): NetworkStatus => {
      if (!navigator.onLine) return 'offline';
      const conn = (navigator as any).connection;
      if (conn && (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' || conn.downlink < 1)) return 'slow';
      return 'online';
    };

    const handleOffline = () => setStatus('offline');
    const handleOnline = () => {
      setStatus('restored');
      setTimeout(() => setStatus('online'), 3000);
    };
    const handleChange = () => setStatus(getStatus());

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    const conn = (navigator as any).connection;
    conn?.addEventListener('change', handleChange);

    setStatus(getStatus());

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      conn?.removeEventListener('change', handleChange);
    };
  }, []);

  return status;
}
