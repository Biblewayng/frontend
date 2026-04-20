import { useState, useEffect } from 'react';
import { useContent } from '@/hooks/useContent';

export default function ContactContent() {
  const { contentMap, contentLoading, contentLoaded, updateContent } = useContent();
  const [fields, setFields] = useState({ address_line1: '', address_line2: '', address_line3: '', address_line4: '', contact_email: '', service_time1: '', service_time2: '' });
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (contentLoaded) {
      setFields({
        address_line1: contentMap.address_line1 || '',
        address_line2: contentMap.address_line2 || '',
        address_line3: contentMap.address_line3 || '',
        address_line4: contentMap.address_line4 || '',
        contact_email: contentMap.contact_email || '',
        service_time1: contentMap.service_time1 || '',
        service_time2: contentMap.service_time2 || '',
      });
    }
  }, [contentLoaded]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(Object.entries(fields).map(([key, value]) => updateContent(key, value)));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof fields, label: string, placeholder: string, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input type={type} value={fields[key]} onChange={(e) => setFields(f => ({ ...f, [key]: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder} />
    </div>
  );

  if (contentLoading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div>
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
          <i className="ri-check-circle-line text-green-400 text-lg mr-3"></i>
          <p className="text-sm font-medium text-green-800">Contact content saved successfully!</p>
        </div>
      )}
      <div className="space-y-8">
        <div className="border-b border-gray-200 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Church Address</h3>
          <div className="space-y-4">
            {field('address_line1', 'Address Line 1', '5, Ali-Asekun Street,')}
            {field('address_line2', 'Address Line 2', 'Olojojo Bus Stop,')}
            {field('address_line3', 'Address Line 3', 'Oworonsoki,')}
            {field('address_line4', 'Address Line 4', 'Lagos, Nigeria.')}
          </div>
        </div>
        <div className="border-b border-gray-200 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Address</h3>
          {field('contact_email', 'Email', 'biblewayft@gmail.com', 'email')}
        </div>
        <div className="border-b border-gray-200 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Times</h3>
          <div className="space-y-4">
            {field('service_time1', 'Service Time 1', 'Wednesdays @ 5:30pm')}
            {field('service_time2', 'Service Time 2', 'Sundays @ 8:30am')}
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
          <i className="ri-save-line mr-2"></i>{saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
