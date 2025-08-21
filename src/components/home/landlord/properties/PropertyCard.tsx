// src/components/properties/PropertyCard.tsx
import { MediaButton } from '@/components/common/MediaButton';
import { Tag } from '@/components/common/Tag';
import {
  FaHome, FaEdit, FaTrash, FaBed, FaBath,
  FaUtensils, FaCouch, FaCar, FaTree, FaStar,
  FaCamera, FaFileAlt, FaDoorOpen, FaHammer, FaBan,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useState } from 'react';

export const PropertyCard = ({ property, showActions = false, onEdit, onDelete, onViewMedia }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const averageRating = property.reviews?.length
    ? (property.reviews.reduce((sum, r) => sum + r.rating, 0) / property.reviews.length).toFixed(1)
    : null;

  // Count media items
  const photoCount = property.imageUrls?.length || property.images?.length || 0;
  const docCount = property.documents?.length || 0;

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
        <div className="p-6">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-gray-900">{property.addressLine1}</h2>
                {property.isActive && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                )}
                {property.occupancyStatus && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    property.occupancyStatus === 'occupied' ? 'bg-blue-100 text-blue-800' :
                    property.occupancyStatus === 'vacant' ? 'bg-green-100 text-green-800' :
                    property.occupancyStatus === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {property.occupancyStatus === 'occupied' ? <FaDoorOpen className="mr-1" /> :
                    property.occupancyStatus === 'vacant' ? <FaHome className="mr-1" /> :
                    property.occupancyStatus === 'maintenance' ? <FaHammer className="mr-1" /> :
                    <FaBan className="mr-1" />}
                    {property.occupancyStatus.charAt(0).toUpperCase() + property.occupancyStatus.slice(1)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{property.addressLine2}</p>
              <p className="text-sm font-medium text-gray-700">
                {property.city}, {property.postcode}
              </p>
            </div>

            {averageRating && (
              <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full">
                <FaStar className="text-amber-400 mr-1.5" />
                <span className="text-sm font-medium text-amber-700">{averageRating}</span>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="flex space-x-4 mb-4">
            <div className="flex items-center">
              <FaBed className="text-gray-500 mr-2" />
              <span>{property.bedrooms} Beds</span>
            </div>
            <div className="flex items-center">
              <FaBath className="text-gray-500 mr-2" />
              <span>{property.bathrooms} Baths</span>
            </div>
            <div className="flex items-center bg-amber-50 px-3 py-1 rounded-lg">
              <FaUtensils className="text-gray-500 mr-2" />
              <span>{property.kitchens} Kitchen</span>
            </div>
          </div>

          {/* Amenities Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {property.hasGarden && (
              <Tag icon={<FaTree />} label="Garden" color="emerald" />
            )}
            {property.parkingType && (
              <Tag icon={<FaCar />}
                label={`${property.parkingType.charAt(0).toUpperCase() + property.parkingType.slice(1)} parking`}
                color="blue" />
            )}
          </div>

          {/* Description */}
          {property.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {property.description}
            </p>
          )}

          {/* Media Preview Section */}
          <div className="mb-4">
            <div className="flex space-x-4">
              <MediaButton
                icon={<FaCamera />}
                count={photoCount}
                label="Photos"
                onClick={() => onViewMedia('photos')}
              />
              <MediaButton
                icon={<FaFileAlt />}
                count={docCount}
                label="Documents"
                onClick={() => onViewMedia('documents')}
              />
            </div>
          </div>

          {/* Footer Section */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FaHome className="text-gray-400 text-sm" />
                <span className="text-xs font-medium text-gray-600 capitalize">
                  {property.propertyType}
                </span>
              </div>

              {showActions && (
                <div className="flex space-x-3">
                  <button
                    onClick={onEdit}
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <FaEdit className="mr-1.5" /> Edit
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="flex items-center text-sm text-rose-600 hover:text-rose-800 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <FaTrash className="mr-1.5" /> Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
  <div className="fixed inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center p-4 z-50 backdrop-blur-[0.5px]">
    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl border border-gray-200 dark:border-gray-800">
      <div className="flex items-start">
        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
          <FaExclamationTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete property</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this property? This action cannot be undone.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => setShowDeleteModal(false)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          disabled={isDeleting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={confirmDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
};