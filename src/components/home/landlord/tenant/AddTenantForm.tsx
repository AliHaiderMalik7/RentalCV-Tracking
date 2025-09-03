import { useState } from 'react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { toast, ToastContainer } from 'react-toastify';

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
  properties: any;

}

export const AddTenantForm = ({
  onClose,
  properties,

}: AddTenantFormProps) => {
  const currentUser = useQuery(api.auth.getCurrentUser);

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

  const sendEmailVerification = useAction(api.tenancy.sendInviteEmail);




  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [invitationStatus, setInvitationStatus] = useState<'idle' | 'pending' | 'sent' | 'error'>('idle');
  const [sendEmail, setSendEmail] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Use the addTenancy mutation
  const addTenancyMutation = useMutation(api.tenancy.addTenancy);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    console.log("name and value", name, value);

    if (name === 'propertyId') {
      const property = properties.find((p:any) => p._id === value);
      setSelectedProperty(property || null);
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("formData", formData);
    console.log("properties are", properties);

    if (!formData.propertyId || !selectedProperty) {
      alert('Please select a property');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    setInvitationStatus('pending');
    setErrorMessage('');

    try {

      const token = crypto.randomUUID();

      // // Prepare data for the mutation
      const mutationData = {
        propertyId: formData.propertyId,
        startDate: new Date(formData.startDate).getTime(),
        endDate: new Date(formData.endDate).getTime(),
        // monthlyRent: parseFloat(formData.rentAmount),
        // depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : 0,
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        status: "invited",
        inviteToken: token,
        // inviteTokenExpiry,
        landlordId: currentUser?._id,
        // sendEmail,
      };

      console.log("mutation data", mutationData);

      // // Call the mutation
      // @ts-ignore
      const result = await addTenancyMutation(mutationData);
      console.log("result is ", result);


      if (result.success) {
        const emailResponse = await sendEmailVerification({ email: formData.email, token });
        console.log("email response is ", emailResponse);

        toast.success(result.message);
      }

      else {
        setInvitationStatus('error');
        toast.error(result.error)
      }


    } catch (error: any) {
      console.error('Error creating tenancy:', error);
      setInvitationStatus('error');
      setErrorMessage(
        error.message || 'Failed to create tenancy invitation. Please try again.'
      );
    }
  };

  // const getPropertyDisplay = (propertyId: string) => {
  //   const property = properties.find(p => p.id === propertyId);
  //   return property ? property.addressLine1 : 'Select a property';
  // };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6 p-6">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Add New Tenant</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          disabled={invitationStatus === 'pending'}
        >
          ×
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Property Selection */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Property Information</h4>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Select Property*
            </label>
            <select
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              disabled={invitationStatus === 'pending'}
            >

              <option value="">-- Select a property --</option>

              {properties.map((property: any) => (
                // @ts-ignore
                <option key={property.id} value={property._id}>
                  {property.addressLine1}
                </option>
              ))}
            </select>
          </div>

          {selectedProperty && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Selected:</strong> {selectedProperty.addressLine1}
              </p>
            </div>
          )}
        </div>

        {/* Tenancy Details Section */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Tenancy Details</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Start Date*
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                disabled={invitationStatus === 'pending'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                End Date*
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                disabled={invitationStatus === 'pending'}
              />
            </div>
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Rent Amount*
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                <input
                  type="number"
                  name="rentAmount"
                  value={formData.rentAmount}
                  onChange={handleChange}
                  className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md"
                  required
                  min="0"
                  step="0.01"
                  disabled={invitationStatus === 'pending'}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Deposit Amount
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                <input
                  type="number"
                  name="depositAmount"
                  value={formData.depositAmount}
                  onChange={handleChange}
                  className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  step="0.01"
                  disabled={invitationStatus === 'pending'}
                />
              </div>
            </div>
          </div> */}
        </div>

        {/* Tenant Contact Section */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Tenant Contact Info</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Full Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                disabled={invitationStatus === 'pending'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email*
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                disabled={invitationStatus === 'pending'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Mobile
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={invitationStatus === 'pending'}
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
                disabled={invitationStatus === 'pending'}
              />
              <label htmlFor="sendEmail" className="ml-2 text-sm text-gray-600">
                Send Email Invitation
              </label>
            </div>

            {invitationStatus !== 'idle' && invitationStatus !== 'error' && (
              <div className={`text-sm p-2 rounded ${invitationStatus === 'pending'
                ? 'bg-yellow-50 text-yellow-700'
                : 'bg-green-50 text-green-700'
                }`}>
                {invitationStatus === 'pending'
                  ? 'Creating invitation...'
                  : 'Invitation created successfully!'}
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
            disabled={invitationStatus === 'pending'}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#0369a1] hover:bg-[#075985] text-white rounded-md disabled:opacity-50"
            disabled={invitationStatus === 'pending'}
          >
            {invitationStatus === 'pending'
              ? 'Creating Invitation...'
              : 'Save & Invite Tenant'}
          </button>
        </div>
      </form>
    </div>
  );
};