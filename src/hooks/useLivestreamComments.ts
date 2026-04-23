import { useState, useEffect, useRef } from 'react';
import { livestreamService } from '@/services/livestream.service';
import { useAuth } from '@/context/AuthContext';
import LivestreamWebSocket from '@/services/LivestreamWebSocket';

export function useLivestreamComments(streamId: string | null, isLive: boolean) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [viewers, setViewers] = useState<{ name: string; user_id: string | null }[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    const unbindViewers = LivestreamWebSocket.on('viewers-list', (list: any[]) => {
      // Only authenticated (non-guest) viewers
      setViewers(list.filter(v => v.user_id).map(v => ({ name: v.name, user_id: v.user_id })));
    });
    return () => { unbindNew(); unbindDelete(); unbindViewers(); };
  }, []);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages]);

  const handleInputChange = (value: string) => {
    setNewMessage(value);
    // Detect @ mention: find last @ and extract query after it
    const atIndex = value.lastIndexOf('@');
    if (atIndex !== -1) {
      const after = value.slice(atIndex + 1);
      // Only show if no space after @ (still typing the name)
      if (!after.includes(' ') || after === '') {
        setMentionQuery(after);
        return;
      }
    }
    setMentionQuery(null);
  };

  const mentionSuggestions = mentionQuery !== null
    ? viewers.filter(v => v.name.toLowerCase().includes(mentionQuery.toLowerCase()) && v.user_id !== user?.id)
    : [];

  const selectMention = (name: string) => {
    const atIndex = newMessage.lastIndexOf('@');
    setNewMessage(newMessage.slice(0, atIndex) + `@${name} `);
    setMentionQuery(null);
    inputRef.current?.focus();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !streamId || !user) return;
    setSending(true);
    LivestreamWebSocket.send({ type: 'chat-message', streamId, userId: user.id, userName: user.name, comment: newMessage.trim() });
    setNewMessage('');
    setMentionQuery(null);
    setSending(false);
  };

  const handleDelete = (messageId: string) => {
    LivestreamWebSocket.send({ type: 'delete-comment', messageId, streamId });
  };

  return { messages, newMessage, setNewMessage: handleInputChange, sending, containerRef, inputRef, handleSend, handleDelete, mentionSuggestions, selectMention, mentionQuery };
}
