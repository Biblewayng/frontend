import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { timeAgo } from '@/utils/date';

export default function NotificationSettings() {
  const { settings: rawSettings, settingsLoading, recentNotifications, notificationsLoading, updateBulkSettings, testEmail } = useSettings('notifications');
  const TEST_RECIPIENT = 'adelodunpeter24@gmail.com';

  const [settings, setSettings] = useState({
    emailEnabled: true,
    pushEnabled: true,
    email_provider: 'resend' as 'resend' | 'smtp',

    resend_api_key: '',
    resend_from_email: '',
    resend_from_name: '',

    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    smtp_from_email: '',
    smtp_from_name: '',
    smtp_use_tls: true,
    smtp_use_ssl: false,
  });
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!settingsLoading && rawSettings) {
      setSettings(s => ({
        ...s,
        emailEnabled: (rawSettings as any).emailEnabled ?? true,
        pushEnabled: (rawSettings as any).pushEnabled ?? true,
        email_provider: ((rawSettings as any).email_provider as any) === 'smtp' ? 'smtp' : 'resend',
        resend_api_key: (rawSettings as any).resend_api_key || '',
        resend_from_email: (rawSettings as any).resend_from_email || '',
        resend_from_name: (rawSettings as any).resend_from_name || '',
        smtp_host: (rawSettings as any).smtp_host || '',
        smtp_port: String((rawSettings as any).smtp_port ?? '587'),
        smtp_username: (rawSettings as any).smtp_username || '',
        smtp_password: (rawSettings as any).smtp_password || '',
        smtp_from_email: (rawSettings as any).smtp_from_email || '',
        smtp_from_name: (rawSettings as any).smtp_from_name || '',
        smtp_use_tls: (rawSettings as any).smtp_use_tls ?? true,
        smtp_use_ssl: (rawSettings as any).smtp_use_ssl ?? false,
      }));
    }
  }, [settingsLoading, rawSettings]);


  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBulkSettings(settings);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally { setSaving(false); }
  };

  const handleTestEmail = async (provider: 'resend' | 'smtp') => {
    setTestingEmail(true);
    try {
      await testEmail(TEST_RECIPIENT, provider);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (e) {
      console.error('Test email failed:', e);
    } finally { setTestingEmail(false); }
  };

  if (settingsLoading || notificationsLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  const toggle = (key: 'emailEnabled' | 'pushEnabled') =>
    setSettings(s => ({ ...s, [key]: !s[key] }));

  const totalPages = Math.ceil(recentNotifications.length / itemsPerPage);
  const paged = recentNotifications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-4xl">
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
          <i className="ri-check-circle-line text-green-400 text-lg mr-3"></i>
          <p className="text-sm font-medium text-green-800">Notification settings updated successfully!</p>
        </div>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(['emailEnabled', 'pushEnabled'] as const).map((key) => (
              <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{key === 'emailEnabled' ? 'Email' : 'Push'} Notifications</h4>
                  <p className="text-sm text-gray-500">{key === 'emailEnabled' ? 'Send notifications via email' : 'Browser push notifications'}</p>
                </div>
                <button onClick={() => toggle(key)}
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${settings[key] ? 'bg-green-600' : 'bg-gray-200'}`}>
                  <span className={`inline-block h-5 w-5 mt-0.5 transform rounded-full bg-white shadow transition-transform ${settings[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration</h3>

          <div className="mb-6 flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Email Provider</h4>
              <p className="text-sm text-gray-500">Choose how emails are sent (Resend API or SMTP)</p>
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, email_provider: 'resend' }))}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${settings.email_provider === 'resend' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Resend
              </button>
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, email_provider: 'smtp' }))}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${settings.email_provider === 'smtp' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >
                SMTP
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settings.email_provider === 'resend' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resend API Key</label>
                  <div className="relative">
                    <input type={showApiKey ? 'text' : 'password'} value={settings.resend_api_key}
                      onChange={(e) => setSettings(s => ({ ...s, resend_api_key: e.target.value }))}
                      placeholder="re_xxxxxxxxxxxx"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="button" onClick={() => setShowApiKey(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <i className={showApiKey ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                  <input type="email" value={settings.resend_from_email}
                    onChange={(e) => setSettings(s => ({ ...s, resend_from_email: e.target.value }))}
                    placeholder="noreply@yourdomain.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                  <input type="text" value={settings.resend_from_name}
                    onChange={(e) => setSettings(s => ({ ...s, resend_from_name: e.target.value }))}
                    placeholder="Bibleway Fellowship"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </>
            )}

            {settings.email_provider === 'smtp' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                  <input type="text" value={settings.smtp_host}
                    onChange={(e) => setSettings(s => ({ ...s, smtp_host: e.target.value }))}
                    placeholder="smtp.yourdomain.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                  <input type="text" value={settings.smtp_port}
                    onChange={(e) => setSettings(s => ({ ...s, smtp_port: e.target.value }))}
                    placeholder="587"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                  <input type="text" value={settings.smtp_username}
                    onChange={(e) => setSettings(s => ({ ...s, smtp_username: e.target.value }))}
                    placeholder="user@yourdomain.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                  <div className="relative">
                    <input type={showSmtpPassword ? 'text' : 'password'} value={settings.smtp_password}
                      onChange={(e) => setSettings(s => ({ ...s, smtp_password: e.target.value }))}
                      placeholder="********"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="button" onClick={() => setShowSmtpPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <i className={showSmtpPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                  <input type="email" value={settings.smtp_from_email}
                    onChange={(e) => setSettings(s => ({ ...s, smtp_from_email: e.target.value }))}
                    placeholder="noreply@yourdomain.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                  <input type="text" value={settings.smtp_from_name}
                    onChange={(e) => setSettings(s => ({ ...s, smtp_from_name: e.target.value }))}
                    placeholder="Bibleway Fellowship"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">STARTTLS</h4>
                      <p className="text-sm text-gray-500">Use STARTTLS (common on port 587)</p>
                    </div>
                    <button type="button" onClick={() => setSettings(s => ({ ...s, smtp_use_tls: !s.smtp_use_tls }))}
                      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${settings.smtp_use_tls ? 'bg-green-600' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-5 w-5 mt-0.5 transform rounded-full bg-white shadow transition-transform ${settings.smtp_use_tls ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Implicit TLS</h4>
                      <p className="text-sm text-gray-500">Use SSL/TLS (common on port 465)</p>
                    </div>
                    <button type="button" onClick={() => setSettings(s => ({ ...s, smtp_use_ssl: !s.smtp_use_ssl }))}
                      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${settings.smtp_use_ssl ? 'bg-green-600' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-5 w-5 mt-0.5 transform rounded-full bg-white shadow transition-transform ${settings.smtp_use_ssl ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              </>
            )}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Recipient</label>
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <input
                  type="email"
                  value={TEST_RECIPIENT}
                  disabled
                  className="w-full md:flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700"
                />
                <div className="flex items-center gap-2">
                  <button onClick={() => handleTestEmail('resend')} disabled={testingEmail}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                    <i className={`${testingEmail ? 'ri-loader-4-line animate-spin' : 'ri-send-plane-line'} mr-2`}></i>
                    {testingEmail ? 'Sending...' : 'Test Resend'}
                  </button>
                  <button onClick={() => handleTestEmail('smtp')} disabled={testingEmail}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50">
                    <i className={`${testingEmail ? 'ri-loader-4-line animate-spin' : 'ri-send-plane-line'} mr-2`}></i>
                    {testingEmail ? 'Sending...' : 'Test SMTP'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {recentNotifications.length > 0 && (
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
            <div className="space-y-3">
              {paged.map((n: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{n.type}</p>
                    <p className="text-sm text-gray-600">{n.message}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{n.created_at ? timeAgo(n.created_at) : 'N/A'}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${n.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{n.status}</span>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                  <i className="ri-arrow-left-s-line mr-1"></i>Previous
                </button>
                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                  Next<i className="ri-arrow-right-s-line ml-1"></i>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-gray-200 pt-6">
          <button onClick={handleSave} disabled={saving}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
            <i className="ri-save-line mr-2"></i>{saving ? 'Saving...' : 'Save Notification Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
