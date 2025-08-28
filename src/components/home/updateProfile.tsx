import { useEffect, useState } from "react";
import Modal from "../common/Modal";

interface UpdateProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSave: (updatedUser: any) => void;
}

const UpdateProfileForm = ({ isOpen, onClose, user, onSave }: UpdateProfileFormProps) => {
    console.log("user in update profile", user);
    
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        state: "",
        city: "",
        postalCode: "",
      });
      
  // ✅ Sync user into formData when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        address: user.address || "",
        state: user.state || "",
        city: user.city || "",
        postalCode: user.postalCode || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Profile">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="mt-1 w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700">State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="mt-1 w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="mt-1 w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Postal Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Postal Code</label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            className="mt-1 w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Actions */}
        <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateProfileForm;
