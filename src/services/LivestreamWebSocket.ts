import { buildWsUrl } from '@/services/ws';

type EventType = 
  | 'stats' 
  | 'new-comment' 
  | 'comment-deleted' 
  | 'stream-updated' 
  | 'stream-started' 
  | 'stream-ended' 
  | 'stream-status' 
  | 'stream-update'
  | 'stream-status-change'
  | 'viewers-list'
  | 'viewer-kicked'
  | 'viewer-banned'
  | 'pong';

type Listener = (data: any) => void;

class LivestreamWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimeout: number | null = null;
  private heartbeatInterval: number | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private streamId: string | null = null;
  private listeners: Map<EventType, Set<Listener>> = new Map();
  private isIntentionallyClosed = false;
  private connectionCount = 0;
  private messageQueue: any[] = [];

  constructor() {
    this.createConnection = this.createConnection.bind(this);
  }

  connect(streamId: string | null) {
    this.connectionCount++;
    console.log(`[WS] Connect called (ref count: ${this.connectionCount}), streamId:`, streamId);
    
    if (streamId && streamId !== this.streamId) {
      this.streamId = streamId;
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'subscribe', streamId: this.streamId });
      }
    } else if (streamId) {
      this.streamId = streamId;
    }

    this.isIntentionallyClosed = false;
    this.createConnection();
  }

  on(event: EventType, listener: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(listener);
    return () => this.off(event, listener);
  }

  off(event: EventType, listener: Listener) {
    this.listeners.get(event)?.delete(listener);
  }

  private emit(event: EventType, data: any) {
    this.listeners.get(event)?.forEach(listener => {
      try {
        listener(data);
      } catch (e) {
        console.error(`[WS] Error in listener for ${event}:`, e);
      }
    });
  }

  private createConnection() {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) return;
    
    const url = buildWsUrl('/ws');
    console.log('[WS] Creating connection to:', url);
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('[WS] Connection established');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.send({ type: 'subscribe-stream-status' });
      if (this.streamId) {
        this.send({ type: 'subscribe', streamId: this.streamId });
      }
      this.flushQueue();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'pong') {
          this.emit('pong', data);
          return;
        }

        switch (data.type) {
          case 'stats':             this.emit('stats', data.stats); break;
          case 'new-comment':       this.emit('new-comment', data.message); break;
          case 'comment-deleted':   this.emit('comment-deleted', data.messageId); break;
          case 'stream-updated':    this.emit('stream-updated', data); break;
          case 'stream-started':    this.emit('stream-started', data.streamId); break;
          case 'stream-ended':      this.emit('stream-ended', data); break;
          case 'stream-status':     this.emit('stream-status', data); break;
          case 'viewers-list':      this.emit('viewers-list', data.viewers); break;
          case 'viewer-kicked':     this.emit('viewer-kicked', data); break;
          case 'viewer-banned':     this.emit('viewer-banned', data); break;
          default:                  this.emit(data.type, data); break;
        }
      } catch (e) {
        console.error('[WS] Parse error:', e);
      }
    };

    this.ws.onerror = (e) => console.error('[WS] Error:', e);
    
    this.ws.onclose = (e) => {
      console.log('[WS] Connection closed:', e.code, e.reason);
      this.stopHeartbeat();
      if (!this.isIntentionallyClosed) {
        this.attemptReconnect();
      }
    };
  }

  private flushQueue() {
    if (this.messageQueue.length === 0) return;
    console.log(`[WS] Flushing ${this.messageQueue.length} queued messages`);
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const msg = this.messageQueue.shift();
      this.ws.send(JSON.stringify(msg));
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WS] Max reconnect attempts reached');
      return;
    }
    
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = window.setTimeout(() => this.createConnection(), delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return true;
    } else {
      console.log('[WS] Queueing message (socket not open):', data.type);
      this.messageQueue.push(data);
      return false;
    }
  }

  disconnect() {
    this.connectionCount = Math.max(0, this.connectionCount - 1);
    console.log(`[WS] Disconnect called (ref count: ${this.connectionCount})`);
    
    if (this.connectionCount === 0) {
      console.log('[WS] Disconnecting singleton connection');
      this.isIntentionallyClosed = true;
      this.stopHeartbeat();
      this.messageQueue = [];
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      this.streamId = null;
      this.reconnectAttempts = 0;
    }
  }
}

const instance = new LivestreamWebSocket();
export default instance;
