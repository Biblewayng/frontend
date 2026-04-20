import { useLivestreamComments } from '@/hooks/useLivestreamComments';
import { formatTime } from '@/utils/date';

interface Props {
  streamId: string | null;
  isLive: boolean;
  showDeleteButton?: boolean;
}

export default function LiveStreamComments({ streamId, isLive, showDeleteButton = false }: Props) {
  const { messages, newMessage, setNewMessage, sending, containerRef, handleSend, handleDelete } = useLivestreamComments(streamId, isLive);

  if (!isLive) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Comments</h3>
        <div className="text-center py-8 text-gray-500 text-sm">Comments are only available during live streams</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg flex flex-col" style={{ height: '600px' }}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Comments</h3>
        <p className="text-sm text-gray-500">{messages.length} comments</p>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="group flex items-start space-x-2 hover:bg-gray-50 -mx-2 px-2 py-1 rounded">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-blue-600">{msg.user_name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline space-x-2">
                <span className="text-sm font-medium text-gray-900">{msg.user_name}</span>
                <span className="text-xs text-gray-500">{formatTime(msg.created_at)}</span>
              </div>
              <p className="text-sm text-gray-700 break-words">{msg.comment}</p>
            </div>
            {showDeleteButton && (
              <button onClick={() => handleDelete(msg.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-opacity">
                <i className="ri-delete-bin-line text-sm"></i>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="px-6 py-4 border-t border-gray-200">
        <form onSubmit={handleSend} className="flex space-x-2">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a comment..."
            className="flex-1 px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending} />
          <button type="submit" disabled={sending || !newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
