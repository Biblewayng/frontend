import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import PrayersList from './PrayersList';

export default function PrayersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center mb-8">
              <div className="sm:flex-auto">
                <h1 className="text-2xl font-bold text-gray-900">Prayer Requests</h1>
                <p className="mt-2 text-sm text-gray-700">Prayer requests from your congregation.</p>
              </div>
            </div>
            <PrayersList />
          </div>
        </main>
      </div>
    </div>
  );
}
