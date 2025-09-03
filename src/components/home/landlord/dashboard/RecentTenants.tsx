// components/RecentTenants.tsx
import {  FaClock, FaCheckCircle } from 'react-icons/fa';

interface Tenant {
  id: string;
  name: string;
  property: string;
  paymentStatus: 'paid' | 'late';
  leaseEnd: string;
}

const tenantData: Tenant[] = [
  {
    id: '1',
    name: 'John Smith',
    property: '123 Main St',
    paymentStatus: 'late',
    leaseEnd: '2024-01-01'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    property: '456 Oak Ave',
    paymentStatus: 'paid',
    leaseEnd: '2024-03-15'
  },
];

export const RecentTenants = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-bold mb-3">Recent Tenants</h3>
      <ul className="space-y-3">
        {tenantData.map((tenant) => (
          <li key={tenant.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{tenant.name}</p>
              <p className="text-sm text-gray-600">{tenant.property}</p>
            </div>
            <div className="flex items-center gap-2">
              {tenant.paymentStatus === 'paid' ? (
                <FaCheckCircle className="text-green-500" />
              ) : (
                <FaClock className="text-red-500" />
              )}
              <span className="text-xs text-gray-500">{tenant.leaseEnd}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};