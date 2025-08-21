import { FaTools, FaCheckCircle, FaClock } from 'react-icons/fa';

export const MaintenanceRequests = ({ count }: { count: number }) => {
  // Mock data - replace with actual data from your backend
  const requests = [
    {
      id: 1,
      title: 'Kitchen sink leak',
      date: '2023-06-10',
      status: 'completed',
      priority: 'medium'
    },
    {
      id: 2,
      title: 'Bedroom window latch',
      date: '2023-06-15',
      status: 'pending',
      priority: 'low'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': 
        return <FaCheckCircle className="text-green-500" />;
      default: 
        return <FaClock className="text-amber-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const classes = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-amber-100 text-amber-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${classes[priority as keyof typeof classes] || classes.low}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-800">Maintenance Requests</h3>
        <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">
          {count} active
        </span>
      </div>

      {requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <FaTools className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">{req.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(req.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {getStatusIcon(req.status)}
              </div>
              <div className="flex justify-between items-center mt-3">
                {getPriorityBadge(req.priority)}
                <button className="text-xs text-blue-600 hover:text-blue-800">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <FaTools className="mx-auto text-3xl text-gray-300 mb-2" />
          <p className="text-gray-500">No active maintenance requests</p>
        </div>
      )}

      <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
        Submit New Request →
      </button>
    </div>
  );
};