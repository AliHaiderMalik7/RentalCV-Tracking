// components/RecentActivityLog.tsx
import { FaHome, FaMoneyBillWave, FaTools, FaFileSignature } from 'react-icons/fa';

interface ActivityItem {
  id: string;
  type: 'payment' | 'maintenance' | 'lease' | 'inspection';
  message: string;
  date: string;
  property: string;
}

const activityData: ActivityItem[] = [
  {
    id: '1',
    type: 'payment',
    message: 'Rent received for 123 Main St',
    date: '2023-06-15',
    property: '123 Main St'
  },
  {
    id: '2',
    type: 'maintenance',
    message: 'Plumbing issue reported',
    date: '2023-06-14',
    property: '789 Pine Rd'
  },
  {
    id: '3',
    type: 'lease',
    message: 'New lease signed',
    date: '2023-06-10',
    property: '456 Oak Ave'
  },
];

const iconMap = {
  payment: <FaMoneyBillWave className="text-green-500" />,
  maintenance: <FaTools className="text-amber-500" />,
  lease: <FaFileSignature className="text-blue-500" />,
  inspection: <FaHome className="text-purple-500" />
};

export const RecentActivityLog = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-bold mb-4">Recent Activity</h3>
      <ul className="space-y-3">
        {activityData.map((activity) => (
          <li key={activity.id} className="flex items-start gap-3">
            <div className="mt-1">
              {iconMap[activity.type]}
            </div>
            <div>
              <p className="text-sm font-medium">{activity.message}</p>
              <div className="flex gap-2 text-xs text-gray-500">
                <span>{activity.property}</span>
                <span>•</span>
                <span>{activity.date}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};