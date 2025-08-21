import { useState } from 'react';

interface TenantFormData {
  propertyId: string;
  startDate: string;
  endDate: string;
  rentAmount: string;
  depositAmount: string;
  name: string;
  email: string;
  mobile: string;
}

interface Property {
  id: string;
  addressLine1: string;
}

interface AddTenantFormProps {
  onClose: () => void;
  onSubmit: (data: TenantFormData) => void;
  properties: Property[]; // Add properties prop
}

export const AddTenantForm = ({ onClose, onSubmit, properties }: AddTenantFormProps) => {
  const [formData, setFormData] = useState<TenantFormData>({
    propertyId: '',
    startDate: '',
    endDate: '',
    rentAmount: '',
    depositAmount: '',
    name: '',
    email: '',
    mobile: ''
  });

  const [invitationStatus, setInvitationStatus] = useState<'idle' | 'pending' | 'sent'>('idle');
  const [sendEmail, setSendEmail] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId) {
      alert('Please select a property');
      return;
    }
    onSubmit(formData);
    
    if (sendEmail) {
      setInvitationStatus('pending');
      setTimeout(() => {
        setInvitationStatus('sent');
      }, 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Add New Tenant</h3>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Property Selection */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Property Information</h4>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-600 mb-1">Select Property*</label>
            <select
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">-- Select a property --</option>
              {properties?.map(property => (
                <option key={property.id} value={property.id}>
                  {property.addressLine1}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tenancy Details Section */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Tenancy Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Start Date*</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">End Date*</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Rent Amount*</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                <input
                  type="number"
                  name="rentAmount"
                  value={formData.rentAmount}
                  onChange={handleChange}
                  className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Deposit Amount</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                <input
                  type="number"
                  name="depositAmount"
                  value={formData.depositAmount}
                  onChange={handleChange}
                  className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Contact Section */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Tenant Contact Info</h4>
          
          <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Full Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Mobile*</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
        </div>

        {/* Invite Tenant Section */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Invite Tenant</h4>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendEmail"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="sendEmail" className="ml-2 text-sm text-gray-600">
                Send Email Invitation
              </label>
            </div>
            
            {invitationStatus !== 'idle' && (
              <div className={`text-sm p-2 rounded ${
                invitationStatus === 'pending' 
                  ? 'bg-yellow-50 text-yellow-700' 
                  : 'bg-green-50 text-green-700'
              }`}>
                {invitationStatus === 'pending' 
                  ? 'Invitation pending...' 
                  : 'Invitation sent successfully!'}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#0369a1] hover:bg-[#075985] text-white rounded-md"
            disabled={invitationStatus === 'pending'}
          >
            {invitationStatus === 'pending' ? 'Sending...' : 'Save & Invite Tenant'}
          </button>
        </div>
      </form>
    </div>
  );
};