import { useState, lazy, Suspense } from 'react';import { useSeries } from '@/hooks/useSeries';
import { useQueryClient } from '@tanstack/react-query';
import { SERMONS_KEY } from '@/hooks/useSermons';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';

const SermonGrid = lazy(() => import('./SermonGrid'));
const UploadSermonModal = lazy(() => import('./UploadSermonModal'));

const LoadingSpinner = () => (
  <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
);

export default function SermonsPage() {
  const qc = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSeriesModal, setShowSeriesModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-72">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-2xl font-bold text-gray-900">Sermon Library</h1>
                <p className="mt-2 text-sm text-gray-700">
                  Upload, organize, and manage your sermon collection.
                </p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSeriesModal(true)}
                  className="rounded-md bg-gray-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-500 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-folder-line mr-2"></i>
                  Manage Series
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-upload-line mr-2"></i>
                  Upload Sermon
                </button>
              </div>
            </div>

            <div className="mt-8 bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <i className="ri-search-line text-gray-400 text-sm"></i>
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search sermons by title, speaker, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button onClick={() => setViewMode('grid')} className={`p-1 rounded cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}>
                      <i className="ri-grid-line w-4 h-4"></i>
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-1 rounded cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}>
                      <i className="ri-list-check w-4 h-4"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <Suspense fallback={<LoadingSpinner />}>
                <SermonGrid searchTerm={searchTerm} viewMode={viewMode} />
              </Suspense>
            </div>
          </div>
        </main>
      </div>

      {showUploadModal && (
        <Suspense fallback={null}>
          <UploadSermonModal 
            isOpen={showUploadModal} 
            onClose={() => setShowUploadModal(false)} 
            onSuccess={() => { setShowUploadModal(false); qc.invalidateQueries({ queryKey: [SERMONS_KEY] }); }} 
          />
        </Suspense>
      )}
      {showSeriesModal && <SeriesManagementModal isOpen={showSeriesModal} onClose={() => setShowSeriesModal(false)} />}
    </div>
  );
}

function SeriesManagementModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { series, loading, createSeries, deleteSeries } = useSeries();
  const [newSeries, setNewSeries] = useState({ name: '', description: '' });
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeries.name) return;
    setAdding(true);
    try {
      await createSeries({ name: newSeries.name, description: newSeries.description });
      setNewSeries({ name: '', description: '' });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteSeries(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>

        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Manage Series</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleAddSeries} className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-3">Create New Series</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Series name"
                  value={newSeries.name}
                  onChange={(e) => setNewSeries(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <textarea
                  rows={2}
                  maxLength={500}
                  placeholder="Series description"
                  value={newSeries.description}
                  onChange={(e) => setNewSeries(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={adding}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  <i className="ri-add-line mr-2"></i>
                  {adding ? 'Adding...' : 'Add Series'}
                </button>
              </div>
            </form>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Existing Series</h4>
              {loading ? (
                <div className="text-center py-4 text-gray-500">Loading...</div>
              ) : series.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="ri-folder-line text-3xl mb-2"></i>
                  <p className="text-sm">No series created yet</p>
                </div>
              ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {series.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{s.name}</h5>
                      <p className="text-sm text-gray-500">{s.description}</p>
                      <p className="text-xs text-gray-400">{s.sermon_count} sermons</p>
                    </div>
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={deletingId === s.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded cursor-pointer disabled:opacity-50"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className={deletingId === s.id ? 'ri-loader-4-line animate-spin' : 'ri-delete-bin-line'}></i>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer whitespace-nowrap"
            >
              Done
            </button>
          </div>
        </div>
    </div>
  );
}
