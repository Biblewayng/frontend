import { useState } from 'react';
import { toast } from 'sonner';
import { useMembers } from '@/hooks/useMembers';
import { downloadFile } from '@/utils/media';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  filterRole: string;
}

export default function ExportModal({ isOpen, onClose, searchTerm, filterRole }: ExportModalProps) {
  const { exportMembers } = useMembers();
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const blob = await exportMembers(format, {
        search: searchTerm || undefined,
        role: filterRole !== 'all' ? filterRole : undefined,
      });
      const url = window.URL.createObjectURL(blob);
      await downloadFile(url, `members-${new Date().toISOString().split('T')[0]}.${format}`);
      window.URL.revokeObjectURL(url);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export members');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-middle bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-md sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Export Members</h3>
              <p className="text-sm text-gray-500 mt-1">Choose your export format</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>

          <div className="space-y-4">
            <div
              onClick={() => setFormat('csv')}
              className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                format === 'csv'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${
                format === 'csv' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <i className={`ri-file-excel-2-line text-2xl ${
                  format === 'csv' ? 'text-green-600' : 'text-gray-600'
                }`}></i>
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-base font-semibold text-gray-900">CSV Format</h4>
                <p className="text-sm text-gray-500">Excel-compatible spreadsheet</p>
              </div>
              {format === 'csv' && (
                <i className="ri-checkbox-circle-fill text-blue-600 text-xl"></i>
              )}
            </div>

            <div
              onClick={() => setFormat('pdf')}
              className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                format === 'pdf'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${
                format === 'pdf' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <i className={`ri-file-pdf-line text-2xl ${
                  format === 'pdf' ? 'text-red-600' : 'text-gray-600'
                }`}></i>
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-base font-semibold text-gray-900">PDF Format</h4>
                <p className="text-sm text-gray-500">Printable document</p>
              </div>
              {format === 'pdf' && (
                <i className="ri-checkbox-circle-fill text-blue-600 text-xl"></i>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-sm cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center">
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Exporting...
                </span>
              ) : (
                <span className="flex items-center">
                  <i className="ri-download-line mr-2"></i>
                  Export {format.toUpperCase()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
