// src/pages/Profile.tsx
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ProfileView } from "@/components/home/Profile";
import Properties from "@/pages/profile/Properties";
import Tenants from "./Tenants";
import RentalHistoryPage from "./tenant/RentalHistory";
import SettingsPage from "./tenant/Settings";

const ProfilePage = () => {
  const user = useQuery(api.auth.getCurrentUser);
  const [activeTab, setActiveTab] = useState("profile"); // Default to profile tab

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar
        role={user?.roles as "landlord" | "tenant"}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Main Content */}
      <div className="flex-1 ml-20 md:ml-72 p-4 sm:p-6 lg:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {activeTab === "profile" && <ProfileView user={user} />}
          {activeTab === "properties" && <Properties />}
          {activeTab === "tenants" && <Tenants />}
          {activeTab === "rental-history" && <RentalHistoryPage />}
          {activeTab === "settings" && <SettingsPage />}
             {/* {activeTab === "dashboard" && <LandlordDashboard/>} */}
             {/* {activeTab === "dashboard" && <TenantDashboard/>} */}
               {/* {activeTab === "reviews" && <TenantReviewsPage/>} */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;


