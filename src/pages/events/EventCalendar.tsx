


import { useState } from 'react';

const events = [
  {
    id: 1,
    title: 'Youth Retreat 2025',
    date: '2025-03-15',
    endDate: '2025-03-17',
    time: '6:00 PM',
    location: 'Mountain View Camp',
    attendees: 45,
    maxAttendees: 50,
    status: 'confirmed',
    category: 'retreat'
  },
  {
    id: 2,
    title: 'Community Outreach',
    date: '2025-01-20',
    time: '9:00 AM',
    location: 'Downtown Food Bank',
    attendees: 23,
    maxAttendees: 30,
    status: 'confirmed',
    category: 'outreach'
  },
  {
    id: 3,
    title: 'Bible Study Workshop',
    date: '2025-01-25',
    time: '7:00 PM',
    location: 'Fellowship Hall',
    attendees: 18,
    maxAttendees: 25,
    status: 'confirmed',
    category: 'study'
  },
  {
    id: 4,
    title: 'Marriage Enrichment Seminar',
    date: '2025-02-10',
    time: '10:00 AM',
    location: 'Main Sanctuary',
    attendees: 12,
    maxAttendees: 40,
    status: 'planning',
    category: 'seminar'
  }
];

export default function EventCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const getNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'retreat': return 'bg-purple-500';
      case 'outreach': return 'bg-green-500';
      case 'study': return 'bg-blue-500';
      case 'seminar': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={getPrevMonth}
              className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-arrow-left-line"></i>
              </div>
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 cursor-pointer whitespace-nowrap"
            >
              Today
            </button>
            <button
              onClick={getNextMonth}
              className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-arrow-right-line"></i>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 gap-px mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {emptyDays.map((_, index) => (
            <div key={index} className="bg-white h-24"></div>
          ))}
          
          {days.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
            
            return (
              <div
                key={day}
                className={`bg-white h-24 p-2 relative ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`text-xs px-1 py-0.5 rounded text-white truncate cursor-pointer ${getCategoryColor(event.category)}`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500 px-1">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {selectedEvent && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <i className="ri-calendar-line mr-2"></i>
                  {new Date(selectedEvent.date).toLocaleDateString()}
                  {selectedEvent.endDate && ` - ${new Date(selectedEvent.endDate).toLocaleDateString()}`}
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <i className="ri-time-line mr-2"></i>
                  {selectedEvent.time}
                </div>
              </div>
              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <i className="ri-map-pin-line mr-2"></i>
                  {selectedEvent.location}
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <i className="ri-group-line mr-2"></i>
                  {selectedEvent.attendees}/{selectedEvent.maxAttendees} attendees
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 cursor-pointer whitespace-nowrap">
                View Details
              </button>
              <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 cursor-pointer whitespace-nowrap">
                Edit Event
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
