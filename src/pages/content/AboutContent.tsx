import { useState, useEffect } from 'react';
import { useContent } from '@/hooks/useContent';
import RichTextEditor from '@/components/RichTextEditor';

export default function AboutContent() {
  const { contentMap, contentLoading, contentLoaded, updateContent } = useContent();
  const [leadershipText, setLeadershipText] = useState('');
  const [scriptureText, setScriptureText] = useState('');
  const [historyText, setHistoryText] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (contentLoaded) {
      setLeadershipText(contentMap.leadership_text || '');
      setScriptureText(contentMap.scripture_text || '');
      setHistoryText(contentMap.history_text || '');
    }
  }, [contentLoaded, contentMap]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateContent('leadership_text', leadershipText),
        updateContent('scripture_text', scriptureText),
        updateContent('history_text', historyText),
      ]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (contentLoading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div>
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
          <i className="ri-check-circle-line text-green-400 text-lg mr-3"></i>
          <p className="text-sm font-medium text-green-800">About content saved successfully!</p>
        </div>
      )}
      <div className="space-y-8">
        <div className="border-b border-gray-200 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leadership Section</h3>
          <label className="block text-sm font-medium text-gray-700 mb-2">Leadership Text</label>
          <RichTextEditor value={leadershipText} onChange={setLeadershipText} placeholder="Since 1984, hundreds of people..." />
        </div>
        <div className="border-b border-gray-200 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Scripture Card</h3>
          <label className="block text-sm font-medium text-gray-700 mb-2">Scripture Text</label>
          <RichTextEditor value={scriptureText} onChange={setScriptureText} placeholder="Scripture verse and reference..." />
        </div>
        <div className="border-b border-gray-200 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Brief History</h3>
          <label className="block text-sm font-medium text-gray-700 mb-2">Church History</label>
          <RichTextEditor value={historyText} onChange={setHistoryText} placeholder="Bibleway Fellowship Tabernacle is..." />
        </div>
        <button onClick={handleSave} disabled={saving}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
          <i className="ri-save-line mr-2"></i>{saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
