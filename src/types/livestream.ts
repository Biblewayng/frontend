export interface LiveStream {
  id: string;
  title: string;
  description?: string;
  isLive: boolean;
  streamUrl?: string;
  viewers: number;
  startTime?: string;
  endTime?: string;
}

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
  userId?: string;
}
