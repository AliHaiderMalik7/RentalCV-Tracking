import { formatJoinDate } from "../../../utils/helpers";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { FaCheckCircle } from "react-icons/fa";
import UpdateProfileForm from "./updateProfile";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

interface ProfileViewProps {
  user: any;
}

export const ProfileView = ({ user }: ProfileViewProps) => {
  const currentUser = useQuery(api.auth.getCurrentUser);
  const updateProfile = useMutation(api.profile.updateProfile);

  const displayUser = user || currentUser;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isVerifiedLandlord =
    displayUser?.roles === "landlord" && displayUser?.verified === true;

  const handleSave = async (updatedUser: any) => {
    try {
      await updateProfile(updatedUser);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(`Failed to update profile: ${error.message || error}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <UpdateProfileForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={displayUser}
        onSave={handleSave}
      />

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
          <p className="text-slate-600">Manage your account settings</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <img
                src={
                  displayUser?.imageUrl ||
                  "https://randomuser.me/api/portraits/men/1.jpg"
                }
                alt={`${
                  displayUser?.firstName || "User"
                }'s profile picture`}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-emerald-100 object-cover"
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-2xl font-bold text-slate-800">
                  {displayUser?.firstName} {displayUser?.lastName}
                </h2>

                {/* Verified Badge */}
                {isVerifiedLandlord && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full shadow-sm self-center sm:self-auto">
                    <FaCheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="text-emerald-700 font-medium text-sm">
                      Verified Landlord
                    </span>
                  </div>
                )}
              </div>

              <p className="text-slate-600">{displayUser?.email}</p>
              <p className="text-sm text-slate-500 mt-1">
                {displayUser?.city && `${displayUser.city} • `}
                Joined on {formatJoinDate(displayUser?._creationTime)}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-4 text-center sm:text-left">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Profile Details */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Personal Information
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Full Name</p>
              <p className="font-medium">
                {displayUser?.firstName} {displayUser?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-medium">{displayUser?.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Phone</p>
              <p className="font-medium">
                {displayUser?.phone || (
                  <span className="text-slate-400">Not specified</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Address</p>
              <p className="font-medium">
                {displayUser?.address || (
                  <span className="text-slate-400">Not specified</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">City</p>
              <p className="font-medium">
                {displayUser?.city || (
                  <span className="text-slate-400">Not specified</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Account Details
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Membership</p>
              <p className="font-medium">Premium Member</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Account Type</p>
              <p className="font-medium">
                {displayUser?.roles === "landlord"
                  ? "Landlord"
                  : "Tenant"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Member Since</p>
              <p className="font-medium">
                {formatJoinDate(displayUser?._creationTime)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Account Status</p>
              <p
                className={`font-medium ${
                  isVerifiedLandlord
                    ? "text-emerald-600"
                    : "text-slate-400"
                }`}
              >
                {isVerifiedLandlord ? "Verified" : "Not Verified"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
