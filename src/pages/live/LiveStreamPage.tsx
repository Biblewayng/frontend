import { useState, lazy, Suspense } from 'react';
import { formatDate, formatDuration } from '@/utils/date';
import { toast } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { useAdminLivestream } from '@/hooks/useAdminLivestream';
import ConfirmDialog from '@/components/modals/ConfirmDialog';

const ViewersList = lazy(() => import('./ViewersList'));
const StreamStats = lazy(() => import('./StreamStats'));
const LiveStreamComments = lazy(() => import('./LiveStreamComments'));

const LoadingSpinner = () => <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>;

export default function LiveStreamPage() {
  const {
    isLive, loading, currentStreamId, viewerCount, streamStats,
    streamHistory, historyPage, setHistoryPage, totalHistoryPages,
    audioLevel, streamSettings, setStreamSettings,
    handleToggleLive, updateMetadata, toggleMute
  } = useAdminLivestream();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [muted, setMuted] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-72">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Live Audio Streaming</h1>
              <p className="mt-2 text-sm text-gray-700">Broadcast live audio services to your online congregation.</p>
            </div>

            <Suspense fallback={<LoadingSpinner />}>
              <StreamStats isLive={isLive} stats={streamStats} />
            </Suspense>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-blue-900 to-purple-900 relative">
                    {isLive ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="ri-mic-line text-3xl"></i>
                          </div>
                          <h3 className="text-2xl font-semibold mb-2">LIVE AUDIO</h3>
                          <p className="text-gray-300 mb-4">Broadcasting to {viewerCount} listeners</p>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <i className="ri-mic-off-line text-5xl mb-6"></i>
                          <h3 className="text-2xl font-semibold mb-2">Audio Stream Offline</h3>
                          <p className="mb-4">Ready to broadcast live audio to your congregation</p>
                        </div>
                        <button
                          onClick={() => setShowChat(!showChat)}
                          className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white p-3 rounded-lg hover:bg-black/70 transition-colors"
                        >
                          <i className={`${showChat ? 'ri-chat-3-fill' : 'ri-chat-3-line'} text-xl`}></i>
                        </button>
                      </div>
                    )}

                    {isLive && (
                      <>
                        <div className="absolute top-4 left-4 flex items-center space-x-2">
                          <div className="flex items-center bg-red-600 text-white px-3 py-2 rounded-full text-sm font-medium">
                            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                            LIVE AUDIO
                          </div>
                          <div className="bg-black/50 text-white px-3 py-2 rounded-full text-sm">
                            <i className="ri-headphone-line mr-1"></i>
                            {viewerCount} listeners
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                          <button
                            onClick={() => { setMuted(m => !m); toggleMute(); }}
                            className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
                          >
                            <i className={`text-lg ${muted ? 'ri-volume-mute-line' : 'ri-volume-up-line'}`}></i>
                          </button>
                          <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                            {[...Array(20)].map((_, i) => {
                              const isActive = !muted && audioLevel > (i + 1) * 5;
                              const bgColor = isActive
                                ? i < 12 ? 'bg-green-500' : i < 16 ? 'bg-yellow-500' : 'bg-red-500'
                                : 'bg-gray-600';
                              return <div key={i} className={`w-1 h-4 rounded-full transition-all duration-75 ${bgColor}`}></div>;
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        {!isLive ? (
                          <button onClick={() => handleToggleLive(true)} disabled={loading}
                            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
                            <i className="ri-play-line mr-2 text-lg"></i>
                            {loading ? 'Starting...' : 'Start'}
                          </button>
                        ) : (
                          <button onClick={() => setShowStopConfirm(true)} disabled={loading}
                            className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 cursor-pointer">
                            <i className="ri-stop-line mr-2 text-lg"></i>
                            {loading ? 'Ending...' : 'Stop'}
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-sm rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Audio Stream Settings</h3>
                    {isLive && (
                      <button onClick={async () => { try { await updateMetadata(); toast.success('Stream title updated!'); } catch { toast.error('Failed to update stream settings'); } }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm cursor-pointer">
                        Update
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stream Title</label>
                      <input type="text" value={streamSettings.title}
                        onChange={(e) => setStreamSettings(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select value={streamSettings.category}
                        onChange={(e) => setStreamSettings(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full pr-8 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Sunday Service</option>
                        <option>Bible Study</option>
                        <option>Prayer Meeting</option>
                        <option>Special Event</option>
                        <option>Youth Service</option>
                        <option>Worship Night</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea rows={3} maxLength={500} value={streamSettings.description}
                      onChange={(e) => setStreamSettings(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe what's happening in this audio stream..." />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Public Stream</p>
                      <p className="text-xs text-gray-500">Show this stream on the public landing page</p>
                    </div>
                    <button
                      onClick={() => setStreamSettings(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${streamSettings.isPublic ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${streamSettings.isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <Suspense fallback={<LoadingSpinner />}>
                  {showChat && <LiveStreamComments streamId={currentStreamId} isLive={isLive} showDeleteButton={true} />}
                  <ViewersList streamId={currentStreamId} onToggleChat={() => setShowChat(!showChat)} showChat={showChat} />
                </Suspense>
              </div>
            </div>

            <div className="mt-6">
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Stream History</h3>
                <div className="space-y-3">
                  {streamHistory.length > 0 ? streamHistory.map((stream) => {
                    const durationSeconds = stream.end_time && stream.start_time
                      ? Math.floor((new Date(stream.end_time + 'Z').getTime() - new Date(stream.start_time + 'Z').getTime()) / 1000) : 0;
                    return (
                      <div key={stream.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium">{stream.title}</div>
                          <div className="text-xs text-gray-500">
                            {formatDate(stream.start_time || stream.created_at)} •{' '}
                            {durationSeconds > 0 ? formatDuration(durationSeconds) : 'N/A'}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">{stream.viewers || 0} viewers</div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-4 text-gray-500 text-sm">No stream history yet</div>
                  )}
                </div>
                {totalHistoryPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <button onClick={() => setHistoryPage(p => Math.max(1, p - 1))} disabled={historyPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">Page {historyPage} of {totalHistoryPages}</span>
                    <button onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))} disabled={historyPage === totalHistoryPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <ConfirmDialog
        isOpen={showStopConfirm}
        onClose={() => setShowStopConfirm(false)}
        onConfirm={() => { handleToggleLive(false); setShowStopConfirm(false); }}
        title="End livestream"
        message="Are you sure you want to end the livestream? All viewers will be disconnected."
        confirmText="End stream"
        type="danger"
      />
    </div>
  );
}
