interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    title: string;
    date: string;
    location: string;
    type: string;
  };
}

export default function EventDetailsModal({ isOpen, onClose, event }: EventDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Event Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h4>
              <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                {event.type}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <i className="ri-calendar-line text-gray-400 text-xl mr-3 mt-1"></i>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date & Time</p>
                  <p className="text-base text-gray-900">{event.date}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <i className="ri-map-pin-line text-gray-400 text-xl mr-3 mt-1"></i>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-base text-gray-900">{event.location}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <i className="ri-information-line text-gray-400 text-xl mr-3 mt-1"></i>
                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-base text-gray-900">Join us for an amazing time of fellowship, worship, and spiritual growth. This event is designed to bring our community together and strengthen our faith.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <i className="ri-user-line text-gray-400 text-xl mr-3 mt-1"></i>
                <div>
                  <p className="text-sm font-medium text-gray-500">Registration Status</p>
                  <p className="text-base text-green-600 font-semibold">Confirmed</p>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">What to Bring</h5>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Bible and notebook</li>
                <li>Comfortable clothing</li>
                <li>Personal items</li>
              </ul>
            </div>
            
            <div className="flex justify-end pt-4 border-t">
              <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
