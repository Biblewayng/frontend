import { getToken, getRefreshToken, setToken, setRefreshToken } from '@/utils/auth';
import apiClient from './apiClient';

const API_BASE = (import.meta.env.VITE_API_URL as string) || '';

type NotificationHandler = (data: any) => void;

class NotificationSSE {
  private es: EventSource | null = null;
  private handlers: Set<NotificationHandler> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private async getFreshToken(): Promise<string | null> {
    const token = getToken();
    if (!token) return null;

    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 > Date.now()) return token;
    } catch {
      return null;
    }

    // Token expired — refresh it
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return null;
      const { data } = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
      setToken(data.token);
      setRefreshToken(data.refresh_token);
      return data.token;
    } catch {
      return null;
    }
  }

  async connect(): Promise<void> {
    if (this.es) return;

    const token = await this.getFreshToken();
    if (!token) return;

    this.es = new EventSource(`${API_BASE}/notifications/stream?token=${token}`);

    this.es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        this.handlers.forEach((h) => h(data));
      } catch {}
    };

    this.es.onerror = () => {
      this.es?.close();
      this.es = null;
      this.reconnectTimer = setTimeout(() => {
        if (this.handlers.size > 0) this.connect();
      }, 5000);
    };
  }

  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.es?.close();
    this.es = null;
  }

  subscribe(handler: NotificationHandler): () => void {
    this.handlers.add(handler);
    this.connect();
    return () => this.handlers.delete(handler);
  }
}

export const notificationSSE = new NotificationSSE();
