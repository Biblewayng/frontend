import { useState } from 'react';

interface ShareFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
}

export default function ShareFormModal({ isOpen, onClose, formId }: ShareFormModalProps) {
  const [copied, setCopied] = useState(false);
  const formLink = `${window.location.origin}/forms/${formId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-0">
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Share Form</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
          </div>
          
          <div className="px-6 py-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Form Link</label>
              <div className="flex">
                <input
                  type="text"
                  value={formLink}
                  readOnly
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
                />
                <button 
                  onClick={handleCopy}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                >
                  {copied ? (
                    <span className="flex items-center">
                      <i className="ri-check-line mr-1"></i>
                      Copied
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <i className="ri-file-copy-line mr-1"></i>
                      Copy
                    </span>
                  )}
                </button>
              </div>
            </div>


          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
