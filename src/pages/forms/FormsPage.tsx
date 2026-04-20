


import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import FormsList from './FormsList';
import CreateFormModal from './CreateFormModal';

export default function FormsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-72">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-2xl font-bold text-gray-900">Forms Management</h1>
                <p className="mt-2 text-sm text-gray-700">
                  Create and manage registration forms for events, memberships, and surveys.
                </p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-add-line mr-2"></i>
                  Create Form
                </button>
              </div>
            </div>

            <div className="mt-8">
              <div className="sm:flex sm:items-center mb-6">
                <div className="sm:flex-auto">
                  <nav className="flex space-x-8">
                    <button
                      onClick={() => setFilterStatus('all')}
                      className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                        filterStatus === 'all'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      All Forms
                    </button>
                    <button
                      onClick={() => setFilterStatus('active')}
                      className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                        filterStatus === 'active'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setFilterStatus('draft')}
                      className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                        filterStatus === 'draft'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Drafts
                    </button>
                    <button
                      onClick={() => setFilterStatus('closed')}
                      className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                        filterStatus === 'closed'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Closed
                    </button>
                  </nav>
                </div>
              </div>

              <FormsList filterStatus={filterStatus} />
            </div>
          </div>
        </main>
      </div>

      <CreateFormModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onSuccess={() => { setShowCreateModal(false); }} 
      />
    </div>
  );
}
