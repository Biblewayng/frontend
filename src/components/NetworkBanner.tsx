import { useState } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export default function NetworkBanner() {
  const status = useNetworkStatus();
  const [dismissed, setDismissed] = useState(false);

  if (status === 'online') return null;
  if (dismissed && status !== 'offline') return null;

  const config = {
    offline:  { bg: 'bg-red-600',    icon: 'ri-wifi-off-line',      text: "You're offline. Check your connection." },
    slow:     { bg: 'bg-yellow-500', icon: 'ri-signal-wifi-2-line',  text: 'Slow connection detected. Some features may be affected.' },
    restored: { bg: 'bg-green-600',  icon: 'ri-wifi-line',           text: 'Back online.' },
  }[status];

  return (
    <div className={`fixed top-0 left-0 right-0 z-[9999] ${config.bg} text-white text-sm py-2 px-4 flex items-center justify-center gap-2 shadow-md`}>
      <i className={`${config.icon} text-base`}></i>
      <span>{config.text}</span>
      {status !== 'offline' && (
        <button onClick={() => setDismissed(true)} className="absolute right-4 text-white/80 hover:text-white">
          <i className="ri-close-line text-base"></i>
        </button>
      )}
    </div>
  );
}
