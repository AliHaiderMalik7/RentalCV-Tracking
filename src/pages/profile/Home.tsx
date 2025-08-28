// src/pages/Profile.tsx
import { useState } from 'react';
import Sidebar from "@/components/Sidebar";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ProfileView } from "@/components/home/Profile";
import LandlordDashboard from './Dashboard';
import Properties from '@/pages/profile/Properties';
import Tenants from './Tenants';
import RentalHistoryPage from './tenant/RentalHistory';
import TenantDashboard from './tenant/TenantDashboard';
import SettingsPage from './tenant/Settings';
import TenantReviewsPage from './tenant/TenantReview';

const ProfilePage = () => {
    const user = useQuery(api.auth.getCurrentUser);
    const [activeTab, setActiveTab] = useState('profile'); // Default to profile tab



    const handleEditProfile = async () => {
        // Edit profile logic here
    }

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    return (
        <div className="flex min-h-screen bg-slate-100">
            <Sidebar
                role={user?.roles}
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />

            {/* Main Content */}
            <div className="flex-1 ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    {activeTab === "profile" && <ProfileView user={user} onEditProfile={handleEditProfile} />
                    }
                    {activeTab === "properties" && <Properties/>}
                    {activeTab === "dashboard" && <LandlordDashboard/>}

                    {/* {activeTab === "dashboard" && <TenantDashboard/>} */}
                    {activeTab === "tenants" && <Tenants/>}

                    {activeTab === "rental-history" && <RentalHistoryPage/>}
                    {activeTab === "settings" && <SettingsPage/>}
                    {/* {activeTab === "reviews" && <TenantReviewsPage/>} */}

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;