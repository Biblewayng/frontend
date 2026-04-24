import { useState } from 'react';
import { usePastorSchedule } from '@/hooks/usePastorSchedule';
import ScheduleEntryModal from './ScheduleEntryModal';
import type { ScheduleEntry, ScheduleCreate } from '@/types/pastor_schedule';

const TYPE_COLORS: Record<string, string> = {
  meeting: 'bg-blue-600',
  counselling: 'bg-purple-600',
  prep: 'bg-green-600',
  personal: 'bg-orange-500',
};

export default function PastorCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editEntry, setEditEntry] = useState<ScheduleEntry | null>(null);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const { entries, isLoading, createEntry, updateEntry, deleteEntry } = usePastorSchedule(month, year);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();

  const getEntriesForDate = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return entries.filter(e => e.start_datetime.startsWith(dateStr));
  };

  const handleSave = async (data: ScheduleCreate) => {
    if (editEntry) {
      await updateEntry(editEntry.id, data);
    } else {
      await createEntry(data);
    }
    setSelectedDate(null);
    setEditEntry(null);
  };

  const handleDelete = async () => {
    if (editEntry) {
      await deleteEntry(editEntry.id);
      setEditEntry(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">My Schedule</h3>
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentDate(new Date(year, month - 2, 1))} className="p-2 hover:bg-gray-100 rounded-lg">
            <i className="ri-arrow-left-s-line text-xl"></i>
          </button>
          <span className="text-base font-medium min-w-[140px] text-center">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => setCurrentDate(new Date(year, month, 1))} className="p-2 hover:bg-gray-100 rounded-lg">
            <i className="ri-arrow-right-s-line text-xl"></i>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] border-r border-b bg-gray-50 last:border-r-0"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEntries = getEntriesForDate(day);
              const hasEntries = dayEntries.length > 0;
              const isToday = new Date().getDate() === day && new Date().getMonth() + 1 === month && new Date().getFullYear() === year;

              return (
                <div key={day}
                  onClick={() => setSelectedDate(new Date(year, month - 1, day))}
                  className="min-h-[80px] border-r border-b p-1.5 cursor-pointer hover:bg-blue-50 transition-colors last:border-r-0">
                  <span className={`text-sm font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
                    isToday ? 'bg-blue-600 text-white' : hasEntries ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEntries.slice(0, 3).map(e => (
                      <div key={e.id}
                        onClick={ev => { ev.stopPropagation(); setEditEntry(e); }}
                        className={`text-xs text-white px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80 ${TYPE_COLORS[e.type] || 'bg-blue-600'}`}>
                        {e.title}
                      </div>
                    ))}
                    {dayEntries.length > 3 && (
                      <div className="text-xs text-blue-600 font-medium">+{dayEntries.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(selectedDate || editEntry) && (
        <ScheduleEntryModal
          date={selectedDate ?? (editEntry ? new Date(editEntry.start_datetime) : null)}
          entry={editEntry}
          onSave={handleSave}
          onDelete={editEntry ? handleDelete : undefined}
          onClose={() => { setSelectedDate(null); setEditEntry(null); }}
        />
      )}
    </div>
  );
}
