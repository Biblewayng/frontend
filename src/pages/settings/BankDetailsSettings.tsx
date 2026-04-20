import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';

interface BankAccount {
  bank_name: string;
  account_number: string;
  account_name: string;
}

const EMPTY: BankAccount = { bank_name: '', account_number: '', account_name: '' };

export default function BankDetailsSettings() {
  const { settings, settingsLoading, updateBulkSettings } = useSettings();
  const [accounts, setAccounts] = useState<BankAccount[]>([{ ...EMPTY }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settingsLoading) return;
    try {
      const raw = (settings as any).bank_accounts;
      const parsed = JSON.parse(typeof raw === 'string' ? raw : JSON.stringify(raw || '[]'));
      setAccounts(Array.isArray(parsed) && parsed.length ? parsed : [{ ...EMPTY }]);
    } catch {
      setAccounts([{ ...EMPTY }]);
    }
  }, [settingsLoading, (settings as any)?.bank_accounts]);

  const update = (i: number, field: keyof BankAccount, value: string) =>
    setAccounts(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: value } : a));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBulkSettings({ bank_accounts: JSON.stringify(accounts) });
      toast.success('Bank details saved');
    } catch {
      toast.error('Failed to save bank details');
    } finally {
      setSaving(false);
    }
  };

  if (settingsLoading) return <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Bank Details</h3>
        <p className="mt-1 text-sm text-gray-500">These details will be shown to members when making a giving payment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((account, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
            {accounts.length > 1 && (
              <button onClick={() => setAccounts(prev => prev.filter((_, idx) => idx !== i))}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500">
                <i className="ri-delete-bin-line"></i>
              </button>
            )}
            <p className="text-xs font-semibold text-gray-500 uppercase">Account {i + 1}</p>
            {([
              { key: 'bank_name', label: 'Bank Name', placeholder: 'e.g. First Bank' },
              { key: 'account_number', label: 'Account Number', placeholder: 'e.g. 0123456789' },
              { key: 'account_name', label: 'Account Name', placeholder: 'e.g. Bibleway Fellowship Tabernacle' },
            ] as { key: keyof BankAccount; label: string; placeholder: string }[]).map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type="text" value={account[key]} onChange={e => update(i, key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={() => setAccounts(prev => [...prev, { ...EMPTY }])}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1">
          <i className="ri-add-line"></i> Add account
        </button>
        <button onClick={handleSave} disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
