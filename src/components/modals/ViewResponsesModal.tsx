import { useState, useEffect } from 'react';
import { useForms } from '@/hooks/useForms';

interface ViewResponsesModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
}

export default function ViewResponsesModal({ isOpen, onClose, formId }: ViewResponsesModalProps) {
  const { getFormResponses } = useForms();
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [showResponseDetail, setShowResponseDetail] = useState(false);

  useEffect(() => {
    if (isOpen && formId) {
      fetchResponses();
    }
  }, [isOpen, formId]);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const data = await getFormResponses(formId);
      setResponses(data || []);
    } catch (error) {
      console.error('Error fetching responses:', error);
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Form Responses</h3>
              <p className="text-sm text-gray-500 mt-1">Total responses: {responses.length}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-12">Loading responses...</div>
          ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Responses</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{responses.length}</p>
                  </div>
                  <i className="ri-file-list-line text-blue-600 text-2xl"></i>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Completion Rate</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">100%</p>
                  </div>
                  <i className="ri-checkbox-circle-line text-green-600 text-2xl"></i>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Latest Response</p>
                    <p className="text-lg font-bold text-purple-900 mt-1">
                      {responses.length > 0 ? new Date(responses[0].submitted_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <i className="ri-time-line text-purple-600 text-2xl"></i>
                </div>
              </div>
            </div>

            {responses.length === 0 ? (
              <div className="text-center py-12">
                <i className="ri-inbox-line text-gray-400 text-4xl mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
                <p className="text-gray-500">Responses will appear here once people submit the form.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {responses.map((response) => (
                      <tr key={response.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {response.member_name || 'Anonymous'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(response.submitted_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button 
                            onClick={() => {
                              setSelectedResponse(response);
                              setShowResponseDetail(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4 border-t">
              <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                <i className="ri-download-line mr-2"></i>
                Export to CSV
              </button>
              <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                Close
              </button>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Response Detail Modal */}
      {showResponseDetail && selectedResponse && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowResponseDetail(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-0">
              <div className="bg-white px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Response Details</h3>
                  <button onClick={() => setShowResponseDetail(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>
              </div>
              <div className="px-6 py-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium">Submitted By</p>
                      <p className="text-gray-900 mt-1">{selectedResponse.member_name || 'Anonymous'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Submitted At</p>
                      <p className="text-gray-900 mt-1">{new Date(selectedResponse.submitted_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Responses</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedResponse.responses || {}).map(([fieldName, value]) => (
                      <div key={fieldName} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 font-medium mb-1">{fieldName}</p>
                        <p className="text-gray-900">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setShowResponseDetail(false)}
                  className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
