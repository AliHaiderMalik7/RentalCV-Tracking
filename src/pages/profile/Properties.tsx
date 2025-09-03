// src/pages/Properties.tsx
import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { PropertyForm } from '../../components/home/landlord/properties/PropertyForm';
import { PropertyCard } from '../../components/home/landlord/properties/PropertyCard';
import { initialPropertyFormData, PropertyFormData } from '@/types/property';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { toast, ToastContainer } from 'react-toastify';
import Modal from '@/components/common/Modal';
import UpdatePropertyForm from '@/components/home/landlord/properties/UpdatePropertyForm';



const Properties = () => {
    const [isAddingProperty, setIsAddingProperty] = useState(false);
    const [formData, setFormData] = useState<PropertyFormData>(initialPropertyFormData);
    const [selectedProperty, setSelectedProperty] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const addProperty = useMutation(api.properties.create);
    const generateUploadUrl = useMutation(api.properties.generateUploadUrl);
    const updateProperty = useMutation(api.properties.update);

    const deleteProperty = useMutation(api.properties.deleteProperty);
    const properties = useQuery(api.properties.getByLandlord);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const initialFormData: PropertyFormData = {
        addressLine1: '',
        addressLine2: '',
        city: '',
        county: '',
        postcode: '',
        propertyType: 'flat',
        bedrooms: 1,
        bathrooms: 1,
        livingRooms: 1,
        kitchens: 1,
        hasGarden: false,
        parkingType: 'street',
        epcRating: 'C',
        description: '',
        photos: [],
        documents: [],
        rent: 0,
        occupancyStatus: 'vacant'
    };


    const handleEditProperty = (property: any) => {
        setSelectedProperty(property);
        setIsModalOpen(true);
    };

    const handleDelete = async (propertyId: any) => {
        try {
            await deleteProperty({ propertyId });
            toast.success("Property deleted successfully");

        } catch (error) {
            toast.error(`Failed to delete property`);
        }
    };

    const handleAddProperty = async () => {
        setIsSubmitting(true);
        try {
            const imageIds = await processFiles(formData.photos);
            const documentIds = await processFiles(formData.documents);

            const propertyData = {
                addressLine1: formData.addressLine1,
                addressLine2: formData.addressLine2 || undefined,
                city: formData.city,
                county: formData.county,
                postcode: formData.postcode,
                propertyType: formData.propertyType,
                bedrooms: formData.bedrooms,
                bathrooms: formData.bathrooms,
                livingRooms: formData.livingRooms,
                kitchens: formData.kitchens,
                hasGarden: formData.hasGarden,
                parkingType: formData.parkingType,
                rent: formData.rent,
                epcRating: formData?.epcRating,
                occupancyStatus: formData.occupancyStatus,
                description: formData.description,
                images: imageIds,
                documents: documentIds.length > 0 ? documentIds : undefined,
            };


            const response: any = await addProperty(propertyData);
            if (response.success) {
                toast.success(response.message);
            } else {
                toast.error(response.error);
            }
            // Reset form and close modal
            setFormData(initialPropertyFormData);
            setIsAddingProperty(false);

        } catch (error) {
            console.error('Error adding property:', error);
            // You can add a toast notification here
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleFormChange = (newData: PropertyFormData) => {
        setFormData(newData);
    };

    const processFiles = async (files: File[]): Promise<Id<"_storage">[]> => {
        const uploadPromises = files.map(async (file) => {
            // Get upload URL
            const postUrl = await generateUploadUrl();

            // Upload file
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!result.ok) {
                throw new Error(`Upload failed: ${result.statusText}`);
            }

            const json = await result.json();
            return json.storageId as Id<"_storage">;
        });

        return Promise.all(uploadPromises);
    };

    const handleUpdateSubmit = async (updatedData: any) => {
        if (!selectedProperty) return;
        try {
            setIsSubmitting(true);
            const { _creationTime, _id, createdAt, documents, imageUrls, isActive, landlordId, occupancyStatus, ...dataWithoutCreationTime } = updatedData;
            await updateProperty({
                propertyId: selectedProperty._id,
                ...dataWithoutCreationTime,
            });


            toast.success("Property updated successfully!");
            setIsModalOpen(false);
        } catch (err) {
            console.error("Update failed", err);
            toast.error("Failed to update property. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="">
            {/* Sidebar */}

            <ToastContainer />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Update Property"
            >
                {selectedProperty && (
                    <UpdatePropertyForm
                        property={selectedProperty}
                        isSubmitting={isSubmitting}
                        onSubmit={handleUpdateSubmit}
                        onCancel={() => setIsModalOpen(false)}
                    />
                )}
            </Modal>

            {/* Main Content */}
            <div className="">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-800">Property Portfolio</h1>
                        <button
                            onClick={() => setIsAddingProperty(true)}
                            className="bg-[#0369a1] hover:bg-[#075985] text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Add New Property
                        </button>
                    </div>

                    {isAddingProperty && (
                        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                            <PropertyForm
                                formData={formData}
                                onChange={handleFormChange}
                                onSubmit={handleAddProperty}
                                onCancel={() => {
                                    setIsAddingProperty(false);
                                    setFormData(initialFormData);
                                }}
                                isSubmitting={isSubmitting}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties?.map(property => (
                            <PropertyCard
                                // key={property?.id}
                                property={property}
                                showActions={true}
                                onDelete={() => handleDelete(property._id)}
                                onEdit={() => handleEditProperty(property)}
                            />
                        ))}
                    </div>

                    {properties?.length === 0 && (
                        <div className="bg-white rounded-xl shadow-md p-8 text-center">
                            <p className="text-slate-600 mb-4">You haven't added any properties yet</p>
                            <button
                                onClick={() => setIsAddingProperty(true)}
                                className="bg-[#0369a1] hover:bg-[#075985] text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Add Your First Property
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Properties;