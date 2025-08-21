export const PaymentHistoryChart = ({ paidPercentage }: { paidPercentage: number }) => {
    return (
      <div>
        <h3 className="font-medium text-gray-800 mb-4">Payment History</h3>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-green-500 h-4 rounded-full" 
            style={{ width: `${paidPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {paidPercentage}% of payments made on time
        </p>
      </div>
    );
  };