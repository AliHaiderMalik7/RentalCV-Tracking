// src/pages/Tenants.tsx
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AddTenantForm } from "@/components/home/landlord/tenant/AddTenantForm";

const Tenants = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const tenants = useQuery(api.tenancy.getLandlordTenancies);
  const properties = useQuery(api.properties.getByLandlord);

  // Filter tenants based on search term
  const filteredTenants = tenants?.filter((tenant) =>
    tenant.invitedTenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.invitedTenantEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.invitedTenantPhone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasTenants = filteredTenants && filteredTenants.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            className={`px-4 py-2 rounded-lg transition-colors ${
              showAddForm
                ? "bg-gray-500 hover:bg-gray-600 text-white"
                : "bg-[#0369a1] hover:bg-[#075985] text-white"
            }`}
          >
            {showAddForm ? "Cancel" : "Add New Tenant"}
          </button>
        </div>

        {showAddForm && (
          <AddTenantForm
            onClose={() => setShowAddForm(false)}
            properties={properties}
          />
        )}

        {/* Tenants */}
        {hasTenants ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Name", "Email", "Phone", "Address", "Member Since", "Status"].map((col) => (
                        <th
                          key={col}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTenants.map((tenant) => (
                      <tr key={tenant._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {tenant.invitedTenantName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {tenant.invitedTenantEmail}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {tenant.invitedTenantPhone || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">N/A</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(tenant._creationTime).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              tenant.status === "invited"
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-4 md:hidden">
              {filteredTenants.map((tenant) => (
                <div
                  key={tenant._id}
                  className="bg-white rounded-xl shadow p-4 border border-gray-200 flex flex-col gap-2"
                >
                  <div className="text-lg font-semibold text-gray-800">
                    {tenant.invitedTenantName}
                  </div>
                  <div className="text-sm text-gray-600">
                    📧 {tenant.invitedTenantEmail}
                  </div>
                  <div className="text-sm text-gray-600">
                    📞 {tenant.invitedTenantPhone || "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">
                    🏠 N/A
                  </div>
                  <div className="text-sm text-gray-600">
                    📅 {new Date(tenant._creationTime).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <span
                    className={`self-start px-3 py-1 rounded-full text-xs font-semibold ${
                      tenant.status === "invited"
                        ? "bg-red-100 text-red-800"
                        : tenant.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {tenant.status || "N/A"}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="text-gray-500 text-lg mb-2">
              {searchTerm
                ? "No tenants match your search criteria"
                : "No tenants found"}
            </div>
            <div className="text-gray-400 text-sm">
              {!searchTerm && "Add your first tenant by clicking the 'Add New Tenant' button"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tenants;
