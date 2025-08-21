export const QuickActionsTenant = () => {
    return (
      <div>
        <h3 className="font-medium text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="p-3 bg-blue-50 rounded-lg text-blue-600 text-sm">
            Pay Rent
          </button>
          <button className="p-3 bg-amber-50 rounded-lg text-amber-600 text-sm">
            Request Maintenance
          </button>
          <button className="p-3 bg-green-50 rounded-lg text-green-600 text-sm">
            Message Landlord
          </button>
          <button className="p-3 bg-purple-50 rounded-lg text-purple-600 text-sm">
            Renew Lease
          </button>
        </div>
      </div>
    );
  };