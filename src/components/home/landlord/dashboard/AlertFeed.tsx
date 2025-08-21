// components/AlertFeed.tsx
import { FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

interface Alert {
  id: string;
  type: 'warning' | 'success';
  message: string;
  date: string;
}

const alertData: Alert[] = [
  {
    id: '1',
    type: 'warning',
    message: 'Rent overdue for 123 Main St',
    date: '2023-06-16'
  },
  {
    id: '2',
    type: 'success',
    message: 'Maintenance completed at 789 Pine Rd',
    date: '2023-06-15'
  },
];

export const AlertFeed = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-bold mb-3">Alerts</h3>
      <ul className="space-y-3">
        {alertData.map((alert) => (
          <li key={alert.id} className="flex items-start gap-3">
            <div className={`mt-1 ${alert.type === 'warning' ? 'text-red-500' : 'text-green-500'}`}>
              {alert.type === 'warning' ? <FaExclamationTriangle /> : <FaCheckCircle />}
            </div>
            <div>
              <p className="text-sm">{alert.message}</p>
              <p className="text-xs text-gray-500">{alert.date}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};