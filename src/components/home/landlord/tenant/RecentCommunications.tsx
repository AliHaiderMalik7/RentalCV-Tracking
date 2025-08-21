import { FaEnvelope, FaPhone, FaComment } from 'react-icons/fa';

export const RecentCommunications = () => {
  // Mock data - replace with actual data from your backend
  const communications = [
    {
      id: 1,
      type: 'email',
      subject: 'Rent Receipt - June 2023',
      date: '2023-06-05',
      read: true
    },
    {
      id: 2,
      type: 'message',
      subject: 'Maintenance scheduled',
      date: '2023-06-03',
      read: true
    },
    {
      id: 3,
      type: 'phone',
      subject: 'Lease renewal discussion',
      date: '2023-05-28',
      read: false
    }
  ];

  const getIcon = (type: string) => {
    switch(type) {
      case 'email': return <FaEnvelope className="text-blue-500" />;
      case 'phone': return <FaPhone className="text-green-500" />;
      default: return <FaComment className="text-amber-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-800 mb-4">Recent Communications</h3>
      
      <div className="space-y-3">
        {communications.map((comm) => (
          <div 
            key={comm.id} 
            className={`p-3 rounded-lg border ${comm.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {getIcon(comm.type)}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${comm.read ? 'text-gray-700' : 'text-blue-700'}`}>
                  {comm.subject}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(comm.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              {!comm.read && (
                <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
        View All Communications →
      </button>
    </div>
  );
};