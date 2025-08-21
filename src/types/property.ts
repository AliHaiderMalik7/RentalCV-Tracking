// types/property.ts
export interface PropertyFormData {
    addressLine1: string;
    addressLine2: string;
    city: string;
    county: string;
    postcode: string;
    propertyType: 'flat' | 'house' | 'bungalow' | 'other';
    bedrooms: number;
    bathrooms: number;
    livingRooms: number;
    kitchens: number;
    hasGarden: boolean;
    parkingType: 'street' | 'driveway' | 'garage' | 'none';
    epcRating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
    description: string;
    photos: File[];
    documents: File[];
    rent: number,
    occupancyStatus: 'vacant' | 'occupied' | 'maintenance' | 'unavailable'
}

export interface PropertyFormProps {
    formData: PropertyFormData;
    onChange: (data: PropertyFormData) => void;
    onSubmit: any;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export const initialPropertyFormData: PropertyFormData = {
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
