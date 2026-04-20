import { useAuth } from '@/context/AuthContext';

export default function MemberProfile() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm">
        <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-2xl font-bold text-gray-900">Your Profile</h2>
          <p className="text-gray-600 mt-1">Manage your account information.</p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Account Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4 py-1">
              <i className="ri-user-settings-line text-blue-600 text-xl"></i>
              <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6 bg-white">
              <div className="group">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-blue-500 transition-colors">Full Name</label>
                <div className="flex items-center gap-2 text-gray-900 font-medium text-lg">
                  <i className="ri-user-line text-gray-400"></i>
                  {user?.name}
                </div>
              </div>
              
              <div className="group">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-blue-500 transition-colors">Email Address</label>
                <div className="flex items-center gap-2 text-gray-900 font-medium text-lg">
                  <i className="ri-mail-line text-gray-400"></i>
                  {user?.email}
                </div>
              </div>
              
              <div className="group">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-blue-500 transition-colors">Account Role</label>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-100 capitalize">
                    <i className="ri-shield-user-line mr-1.5"></i>
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
