import { formatJoinDate } from "../../../utils/helpers";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { FaCheckCircle } from "react-icons/fa";

interface ProfileViewProps {
    user: any;
    onEditProfile: () => void;
}

export const ProfileView = ({ user, onEditProfile }: ProfileViewProps) => {
    const currentUser = useQuery(api.auth.getCurrentUser);
    const displayUser = user || currentUser;

    // ✅ check if user is a verified landlord
    const isVerifiedLandlord =
        displayUser?.roles === "landlord" && displayUser?.verified === true;

    return (
        <>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
                    <p className="text-slate-600">Manage your account settings</p>
                </div>

                {/* ✅ Verified badge on the right side */}
                {/* {isVerifiedLandlord && ( */}
                    {/* <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full shadow-sm">
                        <FaCheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="text-emerald-700 font-medium text-sm">
                            Verified Landlord
                        </span>
                    </div> */}
                {/* )} */}
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
  <div className="p-6">
    <div className="flex items-center space-x-6">
      <div className="relative">
        <img
          src={
            displayUser?.imageUrl ||
            "https://randomuser.me/api/portraits/men/1.jpg"
          }
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-emerald-100"
        />
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">
            {displayUser?.firstName} {displayUser?.lastName}
          </h2>

          {/* ✅ Verified badge inside profile card */}
          {/* {isVerifiedLandlord && ( */}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full shadow-sm">
              <FaCheckCircle className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-700 font-medium text-sm">
                Verified Landlord
              </span>
            </div>
          {/* )} */}
        </div>

        <p className="text-slate-600">{displayUser?.email}</p>
        <p className="text-sm text-slate-500 mt-1">
          {displayUser?.city && `${displayUser.city} • `}
          Joined on {formatJoinDate(displayUser?._creationTime)}
        </p>
      </div>
    </div>
  </div>

  <div className="border-t border-slate-200 px-6 py-4">
    <button
      onClick={onEditProfile}
      className="text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
    >
      Edit Profile
    </button>
  </div>
</div>


            {/* Profile Details */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-white rounded-xl shadow-md p-6">
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
                                {displayUser?.phone
                                    ? `+${displayUser.phone}`
                                    : "Not specified"}
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

                {/* Account Settings */}
                <div className="bg-white rounded-xl shadow-md p-6">
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
                            <p className="font-medium text-emerald-600">Active</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Verification</p>
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
        </>
    );
};
