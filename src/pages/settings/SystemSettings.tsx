import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useAuthStatus } from '@/context/AuthStatusContext';

export default function SystemSettings() {
  const { settings: rawSettings, settingsLoading, systemStatus, systemStatusLoading, updateBulkSettings } = useSettings('system');
  const { refreshAuthStatus } = useAuthStatus();
  const [settings, setSettings] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!settingsLoading) setSettings(rawSettings);
  }, [settingsLoading, rawSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBulkSettings(settings);
      await refreshAuthStatus();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (settingsLoading || systemStatusLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  const statusCards = [
    { label: 'Database Uptime', value: systemStatus.uptime, icon: 'ri-time-line', color: 'green' },
    { label: 'CPU Usage', value: systemStatus.cpuUsage, icon: 'ri-cpu-line', color: 'blue' },
    { label: 'Memory Usage', value: systemStatus.memoryUsage, icon: 'ri-database-line', color: 'orange' },
    { label: 'Active Users', value: systemStatus.activeUsers, icon: 'ri-user-line', color: 'indigo' },
  ];

  return (
    <div className="max-w-4xl">
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
          <i className="ri-check-circle-line text-green-400 text-lg mr-3"></i>
          <p className="text-sm font-medium text-green-800">System settings updated successfully!</p>
        </div>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statusCards.map(({ label, value, icon, color }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center">
                <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                  <i className={`${icon} text-${color}-600 text-lg`}></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">{label}</p>
                  <p className="text-lg font-bold text-gray-900">{value ?? '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Allow Sign Up</p>
                <p className="text-sm text-gray-500">Allow new users to register on the platform</p>
              </div>
              <button
                onClick={() => setSettings((p: any) => ({ ...p, signup_enabled: p.signup_enabled === 'false' ? 'true' : 'false' }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.signup_enabled === 'false' ? 'bg-gray-300' : 'bg-blue-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.signup_enabled === 'false' ? 'translate-x-1' : 'translate-x-6'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Allow Login</p>
                <p className="text-sm text-gray-500">Allow existing users to log in</p>
              </div>
              <button
                onClick={() => setSettings((p: any) => ({ ...p, login_enabled: p.login_enabled === 'false' ? 'true' : 'false' }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.login_enabled === 'false' ? 'bg-gray-300' : 'bg-blue-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.login_enabled === 'false' ? 'translate-x-1' : 'translate-x-6'}`} />
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Settings</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Upload Size (MB)</label>
            <input type="number" value={settings.maxUploadSize || ''}
              onChange={(e) => setSettings((p: any) => ({ ...p, maxUploadSize: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs" />
          </div>
        </div>
        <div className="border-t border-gray-200 pt-6">
          <button onClick={handleSave} disabled={saving}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
            <i className="ri-save-line mr-2"></i>{saving ? 'Saving...' : 'Save System Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
