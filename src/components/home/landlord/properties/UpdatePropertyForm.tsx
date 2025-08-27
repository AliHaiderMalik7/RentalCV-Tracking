// src/components/properties/UpdatePropertyForm.tsx
import { useState } from "react";
import { PropertyFormData } from "@/types/property";
import {
  FaHome,
  FaTree,
  FaPoundSign,
} from "react-icons/fa";

interface UpdatePropertyFormProps {
  property: PropertyFormData;
  onSubmit: (updatedData: Partial<PropertyFormData>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const UpdatePropertyForm = ({
  property,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: UpdatePropertyFormProps) => {
  const [formData, setFormData] = useState<Partial<PropertyFormData>>(property);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Address Section */}
        <div className="space-y-2 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FaHome className="mr-2 text-[#0369a1]" /> Address Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Address Line 1*
              </label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1 || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Address Line 2
              </label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2 || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                City*
              </label>
              <input
                type="text"
                name="city"
                value={formData.city || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                County*
              </label>
              <input
                type="text"
                name="county"
                value={formData.county || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Postcode*
              </label>
              <input
                type="text"
                name="postcode"
                value={formData.postcode || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="space-y-2 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900">Property Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Property Type*
              </label>
              <select
                name="propertyType"
                value={formData.propertyType || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="flat">Flat</option>
                <option value="house">House</option>
                <option value="bungalow">Bungalow</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Bedrooms*
              </label>
              <input
                type="number"
                name="bedrooms"
                min="1"
                value={formData.bedrooms || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Bathrooms*
              </label>
              <input
                type="number"
                name="bathrooms"
                min="1"
                value={formData.bathrooms || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Living Rooms
              </label>
              <input
                type="number"
                name="livingRooms"
                min="0"
                value={formData.livingRooms || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Kitchens
              </label>
              <input
                type="number"
                name="kitchens"
                min="1"
                value={formData.kitchens || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Rental Information */}
        <div className="space-y-2 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FaPoundSign className="mr-2 text-[#0369a1]" /> Rental Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Monthly Rent (£)*
              </label>
              <input
                type="number"
                name="rent"
                value={formData.rent || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Occupancy Status*
              </label>
              <select
                name="occupancyStatus"
                value={formData.occupancyStatus || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="vacant">Vacant</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Outdoor Features */}
        <div className="space-y-2 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FaTree className="mr-2 text-[#0369a1]" /> Outdoor Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="hasGarden"
                checked={formData.hasGarden || false}
                onChange={handleChange}
                className="h-4 w-4 text-[#0369a1] border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Has Garden
              </label>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Parking Type
              </label>
              <select
                name="parkingType"
                value={formData.parkingType || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="street">Street Parking</option>
                <option value="driveway">Driveway</option>
                <option value="garage">Garage</option>
                <option value="none">No Parking</option>
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="sticky flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          onClick={handleSubmit}
          className="px-4 py-2 bg-[#0369a1] text-white rounded-md hover:bg-[#075985] disabled:opacity-50"
        >
          {isSubmitting ? "Updating..." : "Update Property"}
        </button>
      </div>
    </form>
  );
};

export default UpdatePropertyForm;
