import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface FormField {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  options?: string[];
}

interface FormBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFields?: FormField[];
  onSave: (fields: FormField[]) => void;
}

export default function FormBuilderModal({ isOpen, onClose, initialFields = [], onSave }: FormBuilderModalProps) {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldData, setFieldData] = useState({
    name: '',
    type: 'text',
    required: false,
    options: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFields(initialFields);
    }
  }, [isOpen, initialFields]);

  const fieldTypes = [
    { value: 'text', label: 'Short Text' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'select', label: 'Dropdown' },
    { value: 'radio', label: 'Multiple Choice' },
    { value: 'checkbox', label: 'Checkboxes' }
  ];

  const handleAddField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      name: '',
      type: 'text',
      required: false
    };
    setFields([...fields, newField]);
    setEditingField(newField.id);
    setFieldData({ name: '', type: 'text', required: false, options: '' });
  };

  const handleEditField = (field: FormField) => {
    setEditingField(field.id);
    setFieldData({
      name: field.name,
      type: field.type,
      required: field.required || false,
      options: field.options?.join('\n') || ''
    });
  };

  const handleSaveField = () => {
    if (!fieldData.name.trim()) {
      toast.error('Field name is required');
      return;
    }

    const updatedField: FormField = {
      id: editingField!,
      name: fieldData.name,
      type: fieldData.type,
      required: fieldData.required
    };

    if (['select', 'radio', 'checkbox'].includes(fieldData.type)) {
      const options = fieldData.options.split('\n').filter(o => o.trim());
      if (options.length === 0) {
        toast.error('Please add at least one option');
        return;
      }
      updatedField.options = options;
    }

    setFields(fields.map(f => f.id === editingField ? updatedField : f));
    setEditingField(null);
  };

  const handleDeleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    if (editingField === id) setEditingField(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newFields = [...fields];
    [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    setFields(newFields);
  };

  const handleMoveDown = (index: number) => {
    if (index === fields.length - 1) return;
    const newFields = [...fields];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    setFields(newFields);
  };

  const handleSave = () => {
    if (editingField) {
      toast.error('Please save or cancel the field you are editing');
      return;
    }
    onSave(fields);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Form Builder</h3>
                <p className="text-sm text-gray-500 mt-1">Add and configure form fields</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[calc(100vh-250px)] overflow-y-auto">
            {fields.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <i className="ri-file-list-3-line text-4xl text-gray-400 mb-3"></i>
                <p className="text-gray-500 mb-4">No fields added yet</p>
                <button
                  type="button"
                  onClick={handleAddField}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  <i className="ri-add-line mr-1"></i>Add First Field
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg">
                    {editingField === field.id ? (
                      <div className="p-4 bg-blue-50 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Field Label *
                          </label>
                          <input
                            type="text"
                            value={fieldData.name}
                            onChange={(e) => setFieldData({ ...fieldData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Full Name, Email Address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Field Type *
                          </label>
                          <select
                            value={fieldData.type}
                            onChange={(e) => setFieldData({ ...fieldData, type: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                          >
                            {fieldTypes.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>

                        {['select', 'radio', 'checkbox'].includes(fieldData.type) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Options (one per line) *
                            </label>
                            <textarea
                              value={fieldData.options}
                              onChange={(e) => setFieldData({ ...fieldData, options: e.target.value })}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                              placeholder="Option 1&#10;Option 2&#10;Option 3"
                            />
                          </div>
                        )}

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`required-${field.id}`}
                            checked={fieldData.required}
                            onChange={(e) => setFieldData({ ...fieldData, required: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`required-${field.id}`} className="ml-2 text-sm text-gray-700">
                            Required field
                          </label>
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <button
                            type="button"
                            onClick={handleSaveField}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                          >
                            <i className="ri-check-line mr-1"></i>Save Field
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingField(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-white hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{field.name || 'Untitled Field'}</span>
                              {field.required && <span className="text-red-500 text-xs">*Required</span>}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {fieldTypes.find(t => t.value === field.type)?.label || field.type}
                              </span>
                              {field.options && (
                                <span className="text-xs text-gray-500">
                                  {field.options.length} options
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              type="button"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              title="Move up"
                            >
                              <i className="ri-arrow-up-s-line text-lg"></i>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === fields.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              title="Move down"
                            >
                              <i className="ri-arrow-down-s-line text-lg"></i>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditField(field)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <i className="ri-edit-line text-lg"></i>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteField(field.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <i className="ri-delete-bin-line text-lg"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {fields.length > 0 && !editingField && (
              <button
                type="button"
                onClick={handleAddField}
                className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600"
              >
                <i className="ri-add-line mr-1"></i>Add Another Field
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {fields.length} field{fields.length !== 1 ? 's' : ''} added
              </span>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Save Fields
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
