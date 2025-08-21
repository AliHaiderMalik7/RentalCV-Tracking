import { RentTimelineChart } from "@/components/home/landlord/dashboard/RentTimeLineChart";
import { alerts, properties, tenants } from "../../../utils/data";
import {
    FaBuilding,
    FaPoundSign,
    FaClock,
    FaExclamationTriangle
} from "react-icons/fa";
import { PropertyStatusChart } from "@/components/home/landlord/dashboard/PropertyStatusChart";
import { QuickActions } from "@/components/home/landlord/dashboard/QuickActions";
import { RecentActivityLog } from "@/components/home/landlord/dashboard/RecentActivityLog";
import { RecentTenants } from "@/components/home/landlord/dashboard/RecentTenants";
import { AlertFeed } from "@/components/home/landlord/dashboard/AlertFeed";

export default function LandlordDashboard() {
    const totalProperties = properties?.length || 0;
    const occupiedProperties = properties?.filter(p => p.status === 'occupied').length || 0;
    const latePayments = tenants?.filter(t => t.paymentStatus === 'late').length || 0;
    const openIssues = tenants?.reduce((sum, t) => sum + t.openIssues, 0) || 0;
    const monthlyIncome = properties?.reduce((sum, p) => sum + p.rentAmount, 0) || 0;

    return (
        <div className="space-y-6 ">
            {/* Top Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Properties"
                    value={totalProperties}
                    change={`${occupiedProperties} occupied`}
                    icon={<FaBuilding className="text-[#0369a1]" />}
                />
                <StatCard
                    title="Monthly Income"
                    value={`£${monthlyIncome.toLocaleString()}`}
                    change="+2.5% from last month"
                    icon={<FaPoundSign className="text-green-500" />}
                />
                <StatCard
                    title="Late Payments"
                    value={latePayments}
                    change={latePayments > 0 ? "Needs attention" : "All clear"}
                    icon={<FaClock className="text-red-500" />}
                    alert={latePayments > 0}
                />
                <StatCard
                    title="Open Issues"
                    value={openIssues}
                    change={openIssues > 0 ? "Requires action" : "No issues"}
                    icon={<FaExclamationTriangle className="text-amber-500" />}
                    alert={openIssues > 0}
                />
            </div>

            {/* Main Content Grid */}
            {/* Main Content Grid */}
            {/* Row 1: Alerts, Timeline, Property Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-5 min-h-[20rem]">
                    <AlertFeed />
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 min-h-[20rem]">
                    <RentTimelineChart />
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 min-h-[20rem]">
                    <PropertyStatusChart properties={properties} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-5">
                    <QuickActions />
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5">
                    <RecentTenants />
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5">
                    <RecentActivityLog />
                </div>
            </div>
        </div>
    );
}

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