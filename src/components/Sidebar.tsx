import { 
  FaHome, 
  FaUser, 
  FaCog, 
  FaSignOutAlt,
  FaBuilding,
  FaFileAlt,
  FaUsers,
  FaGavel
} from "react-icons/fa";
import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "react-router-dom";
import "./sidebar.css"; 

interface SidebarProps {
  role?: 'landlord' | 'tenant';
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar = ({ role, activeTab, onTabChange }: SidebarProps) => {
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  const handleSignout = async () => {
    await signOut();
    navigate('/login');
  };

  const getLinks = () => {
    const baseLinks = [
      { id: 'dashboard', icon: <FaHome className="text-[17px]" />, label: "Dashboard" }
    ];

    const roleLinks = role === 'landlord' 
      ? [
          { id: 'properties', icon: <FaBuilding className="text-[17px]" />, label: "My Properties" },
          { id: 'tenants', icon: <FaUsers className="text-[17px]" />, label: "Tenants" },
          { id: 'documents', icon: <FaFileAlt className="text-[17px]" />, label: "Documents" },
          { id: 'disputes', icon: <FaGavel className="text-[17px]" />, label: "Disputes" }
        ]
      : [
          { id: 'rental-history', icon: <FaFileAlt className="text-[17px]" />, label: "Rental History" },
          { id: 'reviews', icon: <FaUsers className="text-[17px]" />, label: "My Reviews" }
        ];

    const profileLinks = [
      { id: 'profile', icon: <FaUser className="text-[17px]" />, label: "Profile" },
      { id: 'settings', icon: <FaCog className="text-[17px]" />, label: "Settings" }
    ];

    return [...baseLinks, ...roleLinks, ...profileLinks];
  };

  return (
    <div className="h-screen bg-[#075985] fixed left-0 top-0 flex flex-col border-r border-[#0a7ba8]/30 
                    transition-all duration-300 w-20 md:w-72">
      
      {/* Logo Section */}
      <div className="px-3 md:px-6 py-7 bg-white/95 backdrop-blur-sm border-b border-[#0a7ba8]/10 flex items-center justify-center md:justify-start">
        <div className="bg-[#0369a1] w-10 h-10 rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-lg">TT</span>
        </div>
        <div className="ml-3 hidden md:block">
          <h1 className="text-2xl font-bold text-[#0369a1] tracking-tight">
            Rental<span className="text-[#075985] font-bold">CV.ai</span>
          </h1>
          <p className="text-xs text-[#0369a1]/80 font-medium tracking-wider mt-0.5">
            {role === 'landlord' ? 'LANDLORD PORTAL' : 'TENANT PORTAL'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 md:px-3 py-6 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1.5">
          {getLinks().map((link) => (
            <li key={link.id}>
              <button
                onClick={() => onTabChange(link.id)}
                className={`flex items-center w-full px-4 md:px-5 py-3 rounded-lg transition-all duration-200 
                  ${activeTab === link.id
                    ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]"
                    : "text-[#d9f1ff] hover:bg-white/5 hover:text-white"
                  }`}
              >
                <span className={`mr-0 md:mr-4 flex justify-center w-6 ${
                  activeTab === link.id ? "text-white" : "text-[#9fd4ff]"
                }`}>
                  {link.icon}
                </span>
                <span className="hidden md:inline text-md font-medium tracking-wide">{link.label}</span>
                {activeTab === link.id && (
                  <span className="ml-auto hidden md:block w-1.5 h-1.5 bg-white rounded-full"></span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-2 md:px-3 py-5 border-t border-[#0a7ba8]/30">
        <button 
          onClick={handleSignout}
          className="flex items-center w-full px-4 md:px-5 py-3 rounded-lg text-[#d9f1ff] 
                     hover:bg-white/5 hover:text-white transition-colors group"
        >
          <FaSignOutAlt className="mr-0 md:mr-4 text-[#9fd4ff] group-hover:text-white transition-colors w-6" />
          <span className="hidden md:inline text-md font-medium tracking-wide">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
