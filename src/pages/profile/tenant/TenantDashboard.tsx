import { QuickActions } from "@/components/home/landlord/dashboard/QuickActions";
import { RentTimelineChart } from "@/components/home/landlord/dashboard/RentTimeLineChart";
import { LeaseStatusCard } from "@/components/home/landlord/tenant/LeaseStatusCard";
import { MaintenanceRequests } from "@/components/home/landlord/tenant/MaintenanceRequests";
import { PaymentHistoryChart } from "@/components/home/landlord/tenant/PaymentHistoryChart";
import { QuickActionsTenant } from "@/components/home/landlord/tenant/QuickActionsTenant";
import { RecentCommunications } from "@/components/home/landlord/tenant/RecentCommunications";
import {
    FaHome,
    FaPoundSign,
    FaClock,
    FaFileAlt,
    FaShieldAlt,
    FaChartLine
  } from "react-icons/fa";

  export default function TenantDashboard() {
    // Mock data - replace with actual data from your backend
    const tenantData = {
      currentProperty: "123 Main St, Apt 4B",
      rentAmount: 1200,
      daysUntilDue: 5,
      documentsPending: 2,
      rentPaidPercentage: 100,
      leaseEndDate: "2024-12-31",
      maintenanceRequests: 1
    };
  
    return (
      <div className="space-y-6">
        {/* Top Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Current Rent"
            value={`£${tenantData.rentAmount.toLocaleString()}`}
            change={`Due in ${tenantData.daysUntilDue} days`}
            icon={<FaPoundSign className="text-[#0369a1]" />}
            alert={tenantData.daysUntilDue <= 3}
          />
          <StatCard
            title="Lease Status"
            value={tenantData.leaseEndDate}
            change={`${daysUntil(tenantData.leaseEndDate)} days remaining`}
            icon={<FaHome className="text-green-500" />}
          />
          <StatCard
            title="Documents"
            value={tenantData.documentsPending}
            change={tenantData.documentsPending > 0 ? "Pending upload" : "All submitted"}
            icon={<FaFileAlt className="text-amber-500" />}
            alert={tenantData.documentsPending > 0}
          />
          <StatCard
            title="Maintenance"
            value={tenantData.maintenanceRequests}
            change={tenantData.maintenanceRequests > 0 ? "Active requests" : "No issues"}
            icon={<FaShieldAlt className="text-blue-500" />}
          />
        </div>
  
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-5 min-h-[20rem]">
            <RentTimelineChart />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 min-h-[20rem]">
            <PaymentHistoryChart paidPercentage={tenantData.rentPaidPercentage} />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 min-h-[20rem]">
            <LeaseStatusCard 
              endDate={tenantData.leaseEndDate}
              address={tenantData.currentProperty}
              rentAmount={tenantData.rentAmount}
            />
          </div>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* <div className="bg-white rounded-xl shadow-sm p-5">
            <QuickActionsTenant />
          </div> */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <RecentCommunications />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <MaintenanceRequests count={tenantData.maintenanceRequests} />
          </div>
        </div>
      </div>
    );
  }
  
  // Reuse the same StatCard component from landlord dashboard
  interface StatCardProps {
    title: string;
    value: string | number;
    change: string;
    icon: React.ReactNode;
    alert?: boolean;
  }
  
  function StatCard({ title, value, change, icon, alert = false }: StatCardProps) {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-5 ${alert ? 'border-l-4 border-red-500' : ''}`}>
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="p-1.5 rounded-lg bg-gray-50">{icon}</div>
        </div>
        <p className="text-2xl font-bold mt-2 text-gray-800">{value}</p>
        <p className={`text-xs mt-1 ${alert ? 'text-red-500' : 'text-gray-500'}`}>
          {change}
        </p>
      </div>
    );
  }
  
  // Helper function to calculate days until lease end
  function daysUntil(endDate: string): number {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }