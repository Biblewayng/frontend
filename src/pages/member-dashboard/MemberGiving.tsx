import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { useGiving } from '@/hooks/useGiving';
import { givingService } from '@/services/giving.service';
import apiClient from '@/services/apiClient';
import DataTable from '@/components/common/DataTable';
import Pagination from '@/components/common/Pagination';
import type { Giving } from '@/types';

export default function MemberGiving() {
  const { user } = useAuth();
  const { createGiving } = useGiving();
  const qc = useQueryClient();
  const year = new Date().getFullYear();
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({ type: 'tithe', amount: '', displayAmount: '' });
  // step: 'form' | 'bank' | 'done'
  const [step, setStep] = useState<'form' | 'bank' | 'done'>('form');
  const [submitting, setSubmitting] = useState(false);

  const { data: givingData, isLoading } = useQuery({
    queryKey: ['member-giving', user?.id, year, page],
    queryFn: () => givingService.getByMember(user!.id, year),
    enabled: !!user?.id,
  });

  const { data: bankData } = useQuery({
    queryKey: ['bank-details'],
    queryFn: () => apiClient.get('/settings/public/bank-details').then(r => r.data),
  });

  const givingHistory: Giving[] = (givingData as any)?.data ?? givingData ?? [];
  const totalPages = (givingData as any)?.pages ?? 1;

  const bankAccounts: { bank_name: string; account_number: string; account_name: string }[] = Array.isArray(bankData) ? bankData : [];

  const handleAmountChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    const display = digits ? Number(digits).toLocaleString() : '';
    setFormData(prev => ({ ...prev, amount: digits, displayAmount: display }));
  };

  // Step 1: show bank details first
  const handleGiveNow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;
    setStep('bank');
  };

  // Step 2: confirm — POST to backend
  const handleConfirm = async () => {
    if (!user?.id) return;
    setSubmitting(true);
    try {
      await createGiving({
        member_id: user.id,
        amount: parseFloat(formData.amount),
        type: formData.type,
        method: 'bank_transfer',
        date: new Date().toISOString().split('T')[0],
      });
      setStep('done');
      setFormData({ type: 'tithe', amount: '', displayAmount: '' });
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['member-giving', user.id, year] }),
      ]);
    } catch {
      toast.error('Failed to record giving');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<Giving, any>[] = [
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => new Date(getValue()).toLocaleDateString() },
    { accessorKey: 'type', header: 'Type', cell: ({ getValue }) => <span className="capitalize">{getValue()}</span> },
    { accessorKey: 'amount', header: 'Amount', cell: ({ getValue }) => <span className="font-semibold text-green-600">₦{Number(getValue()).toLocaleString()}</span> },
    { accessorKey: 'method', header: 'Method', cell: ({ getValue }) => <span className="capitalize">{getValue()}</span> },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Giving history */}
      <div className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Giving History</h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <DataTable
            data={givingHistory}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No giving history found"
          />
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Give form */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Give</h3>

        {step === 'form' && (
          <form onSubmit={handleGiveNow} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giving Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tithe">Tithe</option>
                <option value="offering">Offering</option>
                <option value="missions">Missions</option>
                <option value="building_fund">Building Fund</option>
                <option value="special">Special</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.displayAmount}
                onChange={e => handleAmountChange(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['5000', '10000', '25000'].map(amt => (
                <button key={amt} type="button"
                  onClick={() => handleAmountChange(amt)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  ₦{Number(amt).toLocaleString()}
                </button>
              ))}
            </div>
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold">
              Give Now
            </button>
          </form>
        )}

        {step === 'bank' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h4 className="font-semibold text-gray-900">Bank Transfer Details</h4>
            <p className="text-sm text-gray-600">Transfer <span className="font-bold text-green-600">₦{Number(formData.amount).toLocaleString()}</span> to any of the accounts below, then click Confirm.</p>
            <div className="space-y-3">
              {bankAccounts.length > 0 ? bankAccounts.map((acc, i) => (
                <div key={i} className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm">
                  {bankAccounts.length > 1 && <p className="text-xs font-semibold text-blue-700 uppercase">Account {i + 1}</p>}
                  <div className="flex justify-between"><span className="text-gray-500">Bank</span><span className="font-medium">{acc.bank_name || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Account Number</span><span className="font-mono font-medium">{acc.account_number || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Account Name</span><span className="font-medium">{acc.account_name || '—'}</span></div>
                </div>
              )) : (
                <p className="text-sm text-gray-500">No bank details configured yet.</p>
              )}
            </div>
            <p className="text-xs text-gray-500">Use your name as the transfer description.</p>
            <div className="flex gap-3">
              <button onClick={() => setStep('form')} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Back</button>
              <button onClick={handleConfirm} disabled={submitting} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50">
                {submitting ? 'Confirming...' : 'I have transferred'}
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <i className="ri-check-line text-green-600 text-2xl"></i>
            </div>
            <p className="font-semibold text-gray-900">Thank you for your giving!</p>
            <button onClick={() => setStep('form')} className="text-sm text-blue-600 hover:underline">Give again</button>
          </div>
        )}
      </div>
    </div>
  );
}
