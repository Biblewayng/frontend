import { useState, useEffect } from 'react';
import type { ScheduleEntry, ScheduleCreate } from '@/types/pastor_schedule';

interface Props {
  date: Date | null;
  entry?: ScheduleEntry | null;
  onSave: (data: ScheduleCreate) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
}

const TYPES = ['meeting', 'counselling', 'prep', 'personal'];

export default function ScheduleEntryModal({ date, entry, onSave, onDelete, onClose }: Props) {
  const toLocalISO = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const defaultStart = date ? (() => { const d = new Date(date); d.setHours(9, 0); return toLocalISO(d); })() : '';
  const defaultEnd = date ? (() => { const d = new Date(date); d.setHours(10, 0); return toLocalISO(d); })() : '';

  const [form, setForm] = useState({
    title: entry?.title ?? '',
    description: entry?.description ?? '',
    type: entry?.type ?? 'meeting',
    start_datetime: entry ? toLocalISO(new Date(entry.start_datetime)) : defaultStart,
    end_datetime: entry ? toLocalISO(new Date(entry.end_datetime)) : defaultEnd,
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        start_datetime: new Date(form.start_datetime).toISOString(),
        end_datetime: new Date(form.end_datetime).toISOString(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-gray-900">{entry ? 'Edit Entry' : 'New Schedule Entry'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><i className="ri-close-line text-xl"></i></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
              <input type="datetime-local" value={form.start_datetime} onChange={e => set('start_datetime', e.target.value)} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
              <input type="datetime-local" value={form.end_datetime} onChange={e => set('end_datetime', e.target.value)} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex gap-3 pt-2">
            {entry && onDelete && (
              <button type="button" onClick={onDelete}
                className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                Delete
              </button>
            )}
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : entry ? 'Save Changes' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
