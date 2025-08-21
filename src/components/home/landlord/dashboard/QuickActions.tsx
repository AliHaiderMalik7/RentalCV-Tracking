// components/QuickActions.tsx
import { FaPlus, FaMoneyBillWave, FaTools, FaEnvelope } from 'react-icons/fa';

export const QuickActions = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-bold mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
          <FaPlus className="mb-1" />
          <span className="text-xs">Add Property</span>
        </button>
        <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
          <FaMoneyBillWave className="mb-1" />
          <span className="text-xs">Record Payment</span>
        </button>
        <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors">
          <FaTools className="mb-1" />
          <span className="text-xs">Report Issue</span>
        </button>
        <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors">
          <FaEnvelope className="mb-1" />
          <span className="text-xs">Message Tenants</span>
        </button>
      </div>
    </div>
  );
};