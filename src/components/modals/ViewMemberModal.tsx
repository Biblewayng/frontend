import { useState, useEffect } from 'react';
import { useMembers } from '@/hooks/useMembers';
import { Member } from '@/types';
import { getInitials, getAvatarColor } from '@/utils/avatar';

interface ViewMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
}

export default function ViewMemberModal({ isOpen, onClose, memberId }: ViewMemberModalProps) {
  const { getMember } = useMembers();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && memberId) {
      setLoading(true);
      getMember(memberId)
        .then(setMember)
        .catch(err => console.error('Error loading member:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, memberId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Member Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : member ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className={`h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ${getAvatarColor(member.name)}`}>
                  {getInitials(member.name)}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{member.name}</h4>
                  <p className="text-sm text-gray-500">Member since {new Date(member.dateJoined).getFullYear()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{member.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{member.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    member.role === 'leader' ? 'bg-purple-100 text-purple-800' :
                    member.role === 'volunteer' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {member.role}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    member.membershipStatus === 'active' ? 'bg-green-100 text-green-800' :
                    member.membershipStatus === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {member.membershipStatus}
                  </span>
                </div>
                {member.address && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-sm text-gray-900">{member.address}</p>
                  </div>
                )}
                {member.birthday && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Birthday</p>
                    <p className="text-sm text-gray-900">{new Date(member.birthday).toLocaleDateString()}</p>
                  </div>
                )}
                {member.gender && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gender</p>
                    <p className="text-sm text-gray-900 capitalize">{member.gender}</p>
                  </div>
                )}
                {member.maritalStatus && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Marital Status</p>
                    <p className="text-sm text-gray-900 capitalize">{member.maritalStatus}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Date Joined</p>
                  <p className="text-sm text-gray-900">{new Date(member.dateJoined).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Member not found</div>
          )}
          
          <div className="flex justify-end pt-4 border-t">
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
