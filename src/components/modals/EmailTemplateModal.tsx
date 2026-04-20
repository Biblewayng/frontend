import { useState } from 'react';
import { toast } from 'sonner';
import { emailTemplateService } from '@/services/emailTemplate.service';

interface EmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  templateContent: string;
}

export default function EmailTemplateModal({ isOpen, onClose, templateName, templateContent }: EmailTemplateModalProps) {
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);

  const displayName = templateName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setSending(true);
    try {
      await emailTemplateService.sendTestEmail(templateName, testEmail);
      toast.success(`Test email sent to ${testEmail}`);
      setTestEmail('');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to send test email');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-xl font-semibold text-gray-900">{displayName}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <iframe
                srcDoc={templateContent}
                className="w-full h-[500px] border-0"
                title="Email Template Preview"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send Test Email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendTest}
                  disabled={sending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-1"></i>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="ri-send-plane-line mr-1"></i>
                      Send Test
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
