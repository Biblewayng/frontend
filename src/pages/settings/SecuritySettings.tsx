
import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useQuery } from '@tanstack/react-query';
import { settingsService } from '@/services/settings.service';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function SecuritySettings() {
  const { updateBulkSettings } = useSettings('security');
  const { data: rawSettings } = useQuery({ queryKey: ['settings', 'security'], queryFn: () => settingsService.getAll('security') });
  const { data: securityStats = {} } = useQuery({ queryKey: ['settings', 'security-stats'], queryFn: settingsService.getSecurityStats });
  const { permission, isSubscribed, subscribe, unsubscribe, loading: pushLoading } = usePushNotifications();

  const [settings, setSettings] = useState({
    twoFactorRequired: false, passwordExpiry: '90', minPasswordLength: '8',
    requireSpecialChars: true, sessionTimeout: '30', maxLoginAttempts: '5',
    lockoutDuration: '15', ipWhitelisting: false, auditLogging: true,
    encryptionEnabled: true, sslRequired: true, corsEnabled: false
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rawSettings) setSettings(s => ({ ...s, ...(rawSettings as any) }));
  }, [rawSettings]);



  const handleChange = (setting: string, value: string) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateBulkSettings(settings);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="max-w-4xl">
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <i className="ri-check-circle-line text-green-400 text-lg mr-3 flex-shrink-0"></i>
            <div>
              <p className="text-sm font-medium text-green-800">Security settings updated successfully!</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Security Overview */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="ri-shield-check-line text-green-600 text-lg"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Security Score</p>
                  <p className="text-2xl font-bold text-green-900">{securityStats.securityScore || 0}%</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ri-user-line text-blue-600 text-lg"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Active Sessions</p>
                  <p className="text-2xl font-bold text-blue-900">{securityStats.activeSessions || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i className="ri-error-warning-line text-yellow-600 text-lg"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-600">Security Alerts</p>
                  <p className="text-2xl font-bold text-yellow-900">{securityStats.securityAlerts || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <i className="ri-spam-line text-red-600 text-lg"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-600">Blocked Attempts</p>
                  <p className="text-2xl font-bold text-red-900">{securityStats.blockedAttempts || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Web Push Notifications */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Web Push Notifications</h3>
          <p className="text-sm text-gray-600 mb-6">
            Receive real-time system alerts and notifications directly in your browser.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSubscribed ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <i className={`ri-notification-3-line ${isSubscribed ? 'text-blue-600' : 'text-gray-400'} text-xl`}></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {isSubscribed ? 'Notifications Enabled' : 'Notifications Disabled'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {permission === 'denied' 
                      ? 'Blocked by browser' 
                      : isSubscribed ? 'You are receiving real-time updates' : 'Click to enable browser notifications'}
                  </p>
                </div>
              </div>
              
              {permission === 'denied' ? (
                <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                  Action Required: Check Browser Permissions
                </span>
              ) : (
                <button
                  onClick={isSubscribed ? unsubscribe : subscribe}
                  disabled={pushLoading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isSubscribed 
                      ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {pushLoading ? (
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                  ) : (
                    <i className={`${isSubscribed ? 'ri-notification-off-line' : 'ri-notification-3-line'} mr-2`}></i>
                  )}
                  {isSubscribed ? 'Disable' : 'Enable'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Session Security */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Security</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleChange('maxLoginAttempts', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lockout Duration (minutes)
              </label>
              <input
                type="number"
                value={settings.lockoutDuration}
                onChange={(e) => handleChange('lockoutDuration', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>





        {/* Save Button */}
        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="ri-save-line mr-2"></i>
            {loading ? 'Saving...' : 'Save Security Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}