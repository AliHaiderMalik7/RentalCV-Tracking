import { formatJoinDate } from "../../../utils/helpers";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface ProfileViewProps {
    user:any,
    // user: {
    //     imageUrl?: string;
    //     firstName?: string;
    //     lastName?: string;
    //     email?: string;
    //     city?: string;
    //     _creationTime?: number;
    //     phone?: string;
    //     address?: string;
    //     roles?: string;
    // };
    onEditProfile: () => void;
}

export const ProfileView = ({ user, onEditProfile }: ProfileViewProps) => {
    const currentUser = useQuery(api.auth.getCurrentUser);
    const displayUser = user || currentUser;

    return (
        <>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
                <p className="text-slate-600">Manage your account settings</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <img
                                src={displayUser?.imageUrl || "https://randomuser.me/api/portraits/men/1.jpg"}
                                alt="Profile"
                                className="w-24 h-24 rounded-full border-4 border-emerald-100"
                            />
                            <button className="absolute bottom-0 right-0 bg-emerald-500 text-white p-2 rounded-full hover:bg-emerald-600 transition-colors">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">
                                {displayUser?.firstName} {displayUser?.lastName}
                            </h2>
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
                                {displayUser?.phone ? `+${displayUser.phone}` : "Not specified"}
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
                                {displayUser?.roles === "landlord" ? "Landlord" : "Tenant"}
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
                    </div>
                </div>
            </div>
        </>
    );
};