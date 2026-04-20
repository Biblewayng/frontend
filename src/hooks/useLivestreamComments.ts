import { useState, useEffect, useRef } from 'react';
import { livestreamService } from '@/services/livestream.service';
import { useAuth } from '@/context/AuthContext';
import LivestreamWebSocket from '@/services/LivestreamWebSocket';

export function useLivestreamComments(streamId: string | null, isLive: boolean) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!streamId || !isLive) return;
    livestreamService.getChat(streamId, 50)
      .then((data: any) => setMessages(data))
      .catch(console.error);
  }, [streamId, isLive]);

  useEffect(() => {
    const unbindNew = LivestreamWebSocket.on('new-comment', (msg: any) => {
      setMessages(m => [...m, msg]);
    });
    const unbindDelete = LivestreamWebSocket.on('comment-deleted', (id: string) => {
      setMessages(m => m.filter(msg => msg.id !== id));
    });
    
    return () => {
      unbindNew();
      unbindDelete();
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !streamId || !user) return;
    setSending(true);
    LivestreamWebSocket.send({ type: 'chat-message', streamId, userId: user.id, userName: user.name, comment: newMessage.trim() });
    setNewMessage('');
    setSending(false);
  };

  const handleDelete = (messageId: string) => {
    LivestreamWebSocket.send({ type: 'delete-comment', messageId, streamId });
  };

  return { messages, newMessage, setNewMessage, sending, containerRef, handleSend, handleDelete };
}
