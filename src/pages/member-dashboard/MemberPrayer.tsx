import { useState } from 'react';
import { formatDate } from '@/utils/date';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { prayersService } from '@/services/prayers.service';
import AddPrayerRequestModal from '@/components/modals/AddPrayerRequestModal';
import PrayerRequestDetailsModal from '@/components/modals/PrayerRequestDetailsModal';
import Pagination from '@/components/common/Pagination';

export default function MemberPrayer() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'my' | 'others'>('my');
  const [myPage, setMyPage] = useState(1);
  const [othersPage, setOthersPage] = useState(1);
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const { data: myData, isLoading: myLoading } = useQuery({
    queryKey: ['member-prayers', user?.id, myPage],
    queryFn: () => prayersService.getByMember(user!.id, myPage),
    enabled: !!user?.id,
  });

  const { data: othersData, isLoading: othersLoading } = useQuery({
    queryKey: ['others-prayers', othersPage],
    queryFn: () => prayersService.getAll({ limit: 10, page: othersPage, include_private: false }),
    enabled: activeTab === 'others',
  });

  const myRequests: any[] = (myData as any)?.data ?? myData ?? [];
  const myTotalPages = (myData as any)?.pages ?? 1;
  const othersRequests: any[] = ((othersData as any)?.data ?? othersData ?? [])
    .filter((r: any) => String(r.member_id) !== String(user?.id));
  const othersTotalPages = (othersData as any)?.pages ?? 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Prayer Requests</h3>
        <button
          onClick={() => setShowPrayerModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm cursor-pointer whitespace-nowrap"
        >
          Add Prayer Request
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('my')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
              activeTab === 'my'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <i className="ri-user-line mr-2"></i>
            My Requests
          </button>
          <button
            onClick={() => setActiveTab('others')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
              activeTab === 'others'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <i className="ri-global-line mr-2"></i>
            Others
          </button>
        </nav>
      </div>

      {activeTab === 'my' && (
        myLoading ? <div className="text-center py-12">Loading...</div> :
        myRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <i className="ri-heart-line text-4xl mb-2"></i>
            <p>No prayer requests yet</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {myRequests.map((request: any) => (
                <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-1">{request.title}</h5>
                      <p className="text-sm text-gray-500">{formatDate(request.created_at)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedRequest(request); setShowDetailsModal(true); }}
                    className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
            <Pagination page={myPage} totalPages={myTotalPages} onPageChange={setMyPage} />
          </>
        )
      )}

      {activeTab === 'others' && (
        othersLoading ? <div className="text-center py-12">Loading...</div> :
        othersRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <i className="ri-heart-line text-4xl mb-2"></i>
            <p>No public prayer requests</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {othersRequests.map((request: any) => (
                <div key={request.id} onClick={() => { setSelectedRequest(request); setShowDetailsModal(true); }}
                  className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all">
                  <h5 className="font-medium text-gray-900 mb-1">{request.title}</h5>
                  <p className="text-sm text-gray-500">
                    by {request.member_name || 'Anonymous'} • {formatDate(request.created_at)}
                  </p>
                </div>
              ))}
            </div>
            <Pagination page={othersPage} totalPages={othersTotalPages} onPageChange={setOthersPage} />
          </>
        )
      )}

      <AddPrayerRequestModal
        isOpen={showPrayerModal}
        onClose={() => setShowPrayerModal(false)}
        onSuccess={() => qc.invalidateQueries({ queryKey: ['member-prayers'] })}
      />
      <PrayerRequestDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        request={selectedRequest}
      />
    </div>
  );
}
