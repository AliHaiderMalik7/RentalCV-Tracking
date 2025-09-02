import { useState } from 'react';
import { FaHome, FaPlus, FaTrash, FaEdit, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const RentalHistoryPage = () => {
  const [rentalHistory, setRentalHistory] = useState([
    {
      id: 1,
      address: '123 Main St, Apt 4B, New York, NY',
      landlordName: 'John Smith',
      landlordContact: 'john@example.com',
      rentAmount: 2500,
      duration: 'Jan 2020 - Dec 2022',
      referenceAvailable: true,
      expanded: false
    }
  ]);

  const [newEntry, setNewEntry] = useState({
    address: '',
    landlordName: '',
    landlordContact: '',
    rentAmount: '',
    duration: '',
    referenceAvailable: false
  });

  const [isAdding, setIsAdding] = useState(false);

  const handleAddEntry = () => {
    setRentalHistory([...rentalHistory, {
      id: Date.now(),
      ...newEntry,
      rentAmount: Number(newEntry.rentAmount),
      expanded: false
    }]);
    setNewEntry({
      address: '',
      landlordName: '',
      landlordContact: '',
      rentAmount: '',
      duration: '',
      referenceAvailable: false
    });
    setIsAdding(false);
  };

  const toggleExpand = (id: number) => {
    setRentalHistory(rentalHistory.map(entry => 
      entry.id === id ? {...entry, expanded: !entry.expanded} : entry
    ));
  };

  const handleDelete = (id: number) => {
    setRentalHistory(rentalHistory.filter(entry => entry.id !== id));
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Your Rental History</h1>
            <p className="text-gray-600 mt-1">
              {rentalHistory.length} {rentalHistory.length === 1 ? 'entry' : 'entries'} recorded
            </p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-[#0369a1] hover:bg-[#075985] text-white px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <FaPlus className="text-sm" />
            <span>Add Rental</span>
          </button>
        </div>

        {/* Add Rental Form */}
        {isAdding && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Add New Rental</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address*</label>
                <input
                  type="text"
                  value={newEntry.address}
                  onChange={(e) => setNewEntry({...newEntry, address: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="123 Main St, City, State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Landlord Name*</label>
                <input
                  type="text"
                  value={newEntry.landlordName}
                  onChange={(e) => setNewEntry({...newEntry, landlordName: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Landlord Contact*</label>
                <input
                  type="text"
                  value={newEntry.landlordContact}
                  onChange={(e) => setNewEntry({...newEntry, landlordContact: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Email or phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent ($)*</label>
                <input
                  type="number"
                  value={newEntry.rentAmount}
                  onChange={(e) => setNewEntry({...newEntry, rentAmount: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="2500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration*</label>
                <input
                  type="text"
                  value={newEntry.duration}
                  onChange={(e) => setNewEntry({...newEntry, duration: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Jan 2020 - Dec 2022"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newEntry.referenceAvailable}
                  onChange={(e) => setNewEntry({...newEntry, referenceAvailable: e.target.checked})}
                  className="h-4 w-4 text-[#0369a1] rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Reference Available</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddEntry}
                disabled={!newEntry.address || !newEntry.landlordName || !newEntry.landlordContact || !newEntry.rentAmount || !newEntry.duration}
                className="px-4 py-2 bg-[#0369a1] text-white rounded-md hover:bg-[#075985] disabled:opacity-50"
              >
                Save Rental
              </button>
            </div>
          </div>
        )}

        {/* Rental History List */}
        <div className="space-y-4">
          {rentalHistory.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 mb-4">
                <FaHome className="h-5 w-5 text-[#0369a1]" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No rental history added</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first rental history</p>
              <button
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0369a1] hover:bg-[#075985]"
              >
                Add Rental History
              </button>
            </div>
          ) : (
            rentalHistory.map((entry) => (
              <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div 
                  className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpand(entry.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-full text-[#0369a1]">
                      <FaHome />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{entry.address}</h3>
                      <p className="text-sm text-gray-500">{entry.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${entry.referenceAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {entry.referenceAvailable ? 'Reference Available' : 'No Reference'}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                    >
                      <FaTrash />
                    </button>
                    {entry.expanded ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                  </div>
                </div>
                
                {entry.expanded && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Landlord Name</h4>
                        <p className="text-gray-800">{entry.landlordName}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Landlord Contact</h4>
                        <p className="text-gray-800">{entry.landlordContact}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Monthly Rent</h4>
                        <p className="text-gray-800">${entry.rentAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Duration</h4>
                        <p className="text-gray-800">{entry.duration}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button className="flex items-center gap-1 text-sm text-[#0369a1] hover:text-[#075985]">
                        <FaEdit /> Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalHistoryPage;