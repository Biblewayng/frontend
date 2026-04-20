


import { useState } from 'react';
import PlaylistGrid from './PlaylistGrid';
import CreatePlaylistModal from './CreatePlaylistModal';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useAuth } from '@/context/AuthContext';

interface MemberPlaylistsProps {
  onPlayPlaylist?: (sermons: any[]) => void;
}

export default function MemberPlaylists({ onPlayPlaylist }: MemberPlaylistsProps) {
  const { user } = useAuth();
  const { fetchPlaylists, loading } = usePlaylists();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeSection, setActiveSection] = useState<'my' | 'public'>('my');

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h3 className="text-lg font-semibold text-gray-900">Playlists</h3>
          <p className="mt-1 text-sm text-gray-600">
            Organize your favorite sermons into custom playlists for easy listening.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm cursor-pointer whitespace-nowrap ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <i className="ri-grid-line mr-1"></i>
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm cursor-pointer whitespace-nowrap ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <i className="ri-list-check mr-1"></i>
              List
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            disabled={loading}
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                Loading...
              </>
            ) : (
              <>
                <i className="ri-add-line mr-2"></i>
                New Playlist
              </>
            )}
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveSection('my')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
              activeSection === 'my'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <i className="ri-user-line mr-2"></i>
            My Playlists
          </button>
          <button
            onClick={() => setActiveSection('public')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
              activeSection === 'public'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <i className="ri-global-line mr-2"></i>
            Public Playlists
          </button>
        </nav>
      </div>

      <PlaylistGrid 
        viewMode={viewMode} 
        onRefresh={fetchPlaylists} 
        onCreateClick={() => setShowCreateModal(true)}
        filterType={activeSection}
        currentUserId={user?.id?.toString()}
        onPlayPlaylist={onPlayPlaylist}
      />

      <CreatePlaylistModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchPlaylists}
      />
    </div>
  );
}
