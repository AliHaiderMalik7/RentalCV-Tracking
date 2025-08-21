export const LeaseStatusCard = ({ endDate, address, rentAmount }: { 
    endDate: string; 
    address: string; 
    rentAmount: number 
  }) => {
    return (
      <div>
        <h3 className="font-medium text-gray-800 mb-4">Current Lease</h3>
        <p className="text-gray-600">{address}</p>
        <p className="text-lg font-medium mt-2">£{rentAmount}/month</p>
        <p className="text-sm text-gray-500 mt-1">
          Ends on {new Date(endDate).toLocaleDateString()}
        </p>
      </div>
    );
  };