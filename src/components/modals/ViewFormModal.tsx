import { useState, useEffect } from 'react';
import { useForms } from '@/hooks/useForms';

interface ViewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  formId: string;
}

export default function ViewFormModal({ isOpen, onClose, onEdit, formId }: ViewFormModalProps) {
  const { getForm } = useForms();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && formId) {
      fetchForm();
    }
  }, [isOpen, formId]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const data = await getForm(formId);
      setForm(data);
    } catch (error) {
      console.error('Error fetching form:', error);
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
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Form Preview</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-12">Loading form...</div>
          ) : form ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
              <p className="text-sm text-blue-800">This is a preview of how the form will appear to users</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{form.title}</h4>
              {form.description && (
                <p className="text-sm text-gray-600 mt-1">{form.description}</p>
              )}
            </div>
            
            <div className="space-y-4">
              {form.fields && form.fields.length > 0 ? (
                form.fields.map((field: any) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.name} {field.required && '*'}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea 
                        rows={4} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                        placeholder={field.placeholder || ''}
                        disabled 
                      />
                    ) : (
                      <input 
                        type={field.type || 'text'} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                        placeholder={field.placeholder || ''}
                        disabled 
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No fields added to this form yet
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Close
              </button>
              <button onClick={onEdit} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                Edit Form
              </button>
            </div>
          </div>
          ) : (
            <div className="text-center py-12 text-gray-500">Form not found</div>
          )}
        </div>
      </div>
    </div>
  );
}
