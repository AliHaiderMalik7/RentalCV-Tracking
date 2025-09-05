import { useQuery } from "convex/react";
import { useState } from "react";
import { FaHome, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

// Type for a tenancy with landlord + property

type EnrichedTenancy = {
  _id: Id<"tenancies">;
  landlord?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  } | null;
  property?: {
    addressLine1?: string;
    description?: string;
    rent?: number;
  } | null;
  startDate: number;
  endDate: number;
  status:
  | "invited"
  | "pending_tenant_response"
  | "pending_confirmation"
  | "active"
  | "ended"
  | "declined"
  | "tenant_initiated"
  | "landlord_reviewing"
  | "disputed";
  referenceAvailable: boolean;
};

const RentalHistoryPage = () => {
  const currentUser = useQuery(api.auth.getCurrentUser);

  const tenancyDetails = useQuery(
    api.tenancy.getAllTenanciesByEmail,
    currentUser?.email ? { email: currentUser.email } : "skip"
  ) as EnrichedTenancy[] | undefined;

  // Track which tenancy is expanded
  const [expandedId, setExpandedId] = useState<Id<"tenancies"> | null>(null);

  const toggleExpand = (id: Id<"tenancies">) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Your Rental History
            </h1>
            <p className="text-gray-600 mt-1">
              {tenancyDetails?.length ?? 0}{" "}
              {tenancyDetails?.length === 1 ? "entry" : "entries"} recorded
            </p>
          </div>
        </div>

        {/* Rental History List */}
        <div className="space-y-4">
          {tenancyDetails && tenancyDetails.length > 0 ? (
            tenancyDetails.map((entry) => (
              <div
                key={entry._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Row */}
                {/* Row */}
                <div
                  className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpand(entry._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-full text-[#0369a1]">
                      <FaHome />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {entry?.property?.addressLine1 ?? "No address"}
                      </h3>
                      <p className="text-gray-800">{entry?.property?.description ?? ""}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Pill */}
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${entry.status === "active"
                          ? "bg-green-100 text-green-800"
                          : entry.status === "ended"
                            ? "bg-gray-100 text-gray-800"
                            : entry.status === "invited" ||
                              entry.status === "pending_tenant_response" ||
                              entry.status === "pending_confirmation"
                              ? "bg-yellow-100 text-yellow-800"
                              : entry.status === "declined" ||
                                entry.status === "tenant_initiated" ||
                                entry.status === "landlord_reviewing"
                                ? "bg-orange-100 text-orange-800"
                                : entry.status === "disputed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {entry.status.replace(/_/g, " ").toUpperCase()}
                    </span>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: handle delete
                      }}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                    >
                      <FaTrash />
                    </button>

                    {/* Chevron Icon */}
                    <div className="text-gray-400 p-1">
                      {expandedId === entry._id ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </div>
                </div>


                {/* Expanded */}
                {expandedId === entry._id && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Landlord Name
                        </h4>
                        <p className="text-gray-800">
                          {entry.landlord
                            ? `${entry.landlord.firstName ?? ""} ${entry.landlord.lastName ?? ""
                            }`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Landlord Contact
                        </h4>
                        <p className="text-gray-800">
                          {entry.landlord?.phone ?? "N/A"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Monthly Rent
                        </h4>
                        <p className="text-gray-800">
                          ${entry.property?.rent ?? 0}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Duration
                        </h4>
                        <p className="text-gray-800">
                          {new Date(entry.startDate).toLocaleDateString()} –{" "}
                          {new Date(entry.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 mb-4">
                <FaHome className="h-5 w-5 text-[#0369a1]" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No rental history added
              </h3>
              <p className="text-gray-500 mb-6">
                Get started by adding your first rental history
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalHistoryPage;
