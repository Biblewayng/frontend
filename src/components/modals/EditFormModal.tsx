import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useForms } from '@/hooks/useForms';
import FormBuilderModal from '@/components/modals/FormBuilderModal';

interface EditFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  onSuccess?: () => void;
}

interface FormField {
  id: string;
  name: string;
  type: string;
}

export default function EditFormModal({ isOpen, onClose, formId, onSuccess }: EditFormModalProps) {
  const { getForm, updateForm } = useForms();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'registration',
    status: 'active',
    deadline: '',
    is_public: true
  });
  const [fields, setFields] = useState<FormField[]>([]);

  useEffect(() => {
    if (isOpen && formId) {
      fetchForm();
    }
  }, [isOpen, formId]);

  const fetchForm = async () => {
    try {
      setLoadingData(true);
      const form = await getForm(formId);
      setFormData({
        title: form.title || '',
        description: form.description || '',
        type: form.type || 'registration',
        status: form.status || 'active',
        deadline: form.deadline ? form.deadline.split('T')[0] : '',
        is_public: form.is_public ?? true
      });
      setFields(form.fields || []);
    } catch (error) {
      console.error('Error fetching form:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateForm(formId, {
        ...formData,
        fields,
        deadline: formData.deadline || null
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating form:', error);
      toast.error('Failed to update form');
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
            <h3 className="text-xl font-bold text-gray-900">Edit Form</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
          
          {loadingData ? (
            <div className="text-center py-8">Loading form data...</div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Form Title *</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                rows={3} 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Form Type *</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="registration">Registration</option>
                  <option value="survey">Survey</option>
                  <option value="feedback">Feedback</option>
                  <option value="application">Application</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                <input 
                  type="date" 
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              
              <div className="flex items-center pt-8">
                <input 
                  type="checkbox" 
                  id="isPublic" 
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                />
                <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">Make form public</label>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">Form Fields</h4>
                <button
                  type="button"
                  onClick={() => setShowBuilder(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  <i className="ri-layout-grid-line mr-1"></i>Open Form Builder
                </button>
              </div>
              {fields.length > 0 ? (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600 mb-2">{fields.length} field{fields.length !== 1 ? 's' : ''} configured</p>
                  <div className="space-y-1">
                    {fields.map((field, index) => (
                      <div key={field.id} className="text-xs text-gray-500">
                        {index + 1}. {field.name} ({field.type})
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-center">
                  <p className="text-sm text-gray-500">No fields configured yet</p>
                </div>
              )}
            </div>
          
            <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
      <FormBuilderModal
        isOpen={showBuilder}
        onClose={() => setShowBuilder(false)}
        initialFields={fields}
        onSave={setFields}
      />
    </div>
  );
}
