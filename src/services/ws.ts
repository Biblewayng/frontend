const DEFAULT_WS_BASE_URL = 'ws://localhost:8000';

export const WS_BASE_URL = import.meta.env.VITE_WS_URL || DEFAULT_WS_BASE_URL;

export function buildWsUrl(path: string = '/ws') {
  const desiredPath = path.startsWith('/') ? path : `/${path}`;

  const coerce = (raw: string) => {
    if (raw.startsWith('ws://') || raw.startsWith('wss://')) return raw;
    // Allow values like "localhost:8000"
    return `ws://${raw}`;
  };

  const base = coerce(WS_BASE_URL);
  const u = new URL(base);
  u.pathname = desiredPath;
  u.search = '';
  u.hash = '';
  return u.toString();
}

