// src/pages/Tenants.tsx
import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from '../../../convex/_generated/api';
import { AddTenantForm } from '@/components/home/landlord/tenant/AddTenantForm';

// interface TenantFormData {
//     startDate: string;
//     endDate: string;
//     rentAmount: string;
//     depositAmount: string;
//     firstName: string;
//     lastName: string;
//     email: string;
//     phone: string;
//     address: string;
//     city: string;
// }

// interface Tenant {
//     _id: Id<"users">;
//     _creationTime: number;
//     firstName: string;
//     lastName?: string;
//     email: string;
//     phone?: string;
//     address?: string;
//     city?: string;
// }

const Tenants = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState<TenantFormData>({
        startDate: '',
        endDate: '',
        rentAmount: '',
        depositAmount: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: ''
    });

    const tenants = useQuery(api.tenancy.getLandlordTenancies);
    const properties = useQuery(api.properties.getByLandlord);

    console.log("tenants are", tenants);



    const handleAddTenant = async (e: React.FormEvent) => {
        e.preventDefault();
        // try {
        //     await createTenant({
        //         firstName: formData.firstName,
        //         lastName: formData.lastName,
        //         email: formData.email,
        //         phone: formData.phone,
        //         address: formData.address,
        //         city: formData.city,
        //         startDate: formData.startDate,
        //         endDate: formData.endDate,
        //         rentAmount: parseFloat(formData.rentAmount),
        //         depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : undefined
        //     });
        //     setShowAddForm(false);
        //     setFormData({
        //         startDate: '',
        //         endDate: '',
        //         rentAmount: '',
        //         depositAmount: '',
        //         firstName: '',
        //         lastName: '',
        //         email: '',
        //         phone: '',
        //         address: '',
        //         city: ''
        //     });
        // } catch (error) {
        //     console.error('Error creating tenant:', error);
        // }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // const filteredTenants = tenants?.filter(tenant => {
    //     const searchLower = searchTerm.toLowerCase();
    //     return (
    //         tenant.firstName.toLowerCase().includes(searchLower) ||
    //         (tenant.lastName && tenant.lastName.toLowerCase().includes(searchLower)) ||
    //         tenant.email.toLowerCase().includes(searchLower) ||
    //         (tenant.phone && tenant.phone.includes(searchTerm)) ||
    //         (tenant.address && tenant.address.toLowerCase().includes(searchLower)) ||
    //         (tenant.city && tenant.city.toLowerCase().includes(searchLower))
    //     );
    // });

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="flex flex-col gap-6">
                <h1 className="text-3xl font-bold text-gray-800">Tenants</h1>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <input
                        type="text"
                        placeholder="Search tenants by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className={`px-4 py-2 rounded-lg transition-colors ${showAddForm
                            ? 'bg-gray-500 hover:bg-gray-600 text-white'
                            : 'bg-[#0369a1] hover:bg-[#075985] text-white'
                            }`}
                    >
                        {showAddForm ? 'Add New Tenant' : 'Add New Tenant'}
                    </button>
                </div>

                {showAddForm && (
                    <AddTenantForm onClose={() => setShowAddForm(false)} onSubmit={handleAddTenant} properties={properties} />
                )}

                {/* Tenants Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Phone
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Address
                                    </th>
                                    {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        City
                                    </th> */}
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Member Since
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status                  </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tenants ? (
                                    tenants?.map((tenant) => (
                                        <tr key={tenant._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {tenant.invitedTenantName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {tenant.invitedTenantEmail}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {tenant.invitedTenantPhone || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {tenant.invitedTenantAddress || 'N/A'}
                                            </td>
                                         
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(tenant._creationTime).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${tenant.status === "pending"
                                                            ? "bg-red-100 text-red-800"
                                                            : tenant.status === "active"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-gray-100 text-gray-800"
                                                        }`}
                                                >
                                                    {tenant.status || "N/A"}
                                                </span>
                                            </td>

                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                            {searchTerm
                                                ? "No tenancies match your search criteria"
                                                : "No tenants found"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tenants;