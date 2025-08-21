import { FaHome, FaUserTie } from "react-icons/fa";
import signupImage from "../../../public/banner.avif";
import { useNavigate } from "react-router-dom";
import AuthBanner from "@/components/common/AuthBanner";

type RoleSelectionProps = {
  onSelect: (role: "tenant" | "landlord") => void;
};

const RoleSelection = ({ onSelect }: RoleSelectionProps) => {
  const navigate = useNavigate()
  const handleLogin = () => {
    navigate("/login")
  }
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans antialiased">
      {/* Left Side - Same Image Section */}
      <div className="hidden lg:flex lg:w-1/2 h-screen sticky top-0 flex-col items-center justify-center bg-gray-200 p-8 relative">
        <AuthBanner
          imageSrc={signupImage}

        />
      </div>

      {/* Right Side - Role Selection */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0369a1] to-[#0284c7] p-8 text-center">
            <h2 className="text-3xl font-light text-white mb-1 tracking-wide">
              Join As
            </h2>
            <p className="text-white font-light">
              Select your role to get started
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="p-8 space-y-8">
            {/* Tenant Card */}
            <button
              onClick={() => onSelect("tenant")}
              className="w-full group flex items-center space-x-6 p-6 border border-slate-200 rounded-xl hover:border-[#0369a1] transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0369a1] focus:ring-offset-2"
            >
              <div className="bg-[#ebf5ff] p-4 rounded-full text-[#0369a1] group-hover:bg-[#0369a1] group-hover:text-white transition-colors duration-300">
                <FaHome className="text-2xl" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-medium text-slate-800">
                  I'm a Tenant
                </h3>
                <p className="text-slate-500 mt-1">
                  Find your perfect home with verified landlords
                </p>
              </div>
            </button>

            {/* Landlord Card */}
            <button
              onClick={() => onSelect("landlord")}
              className="w-full group flex items-center space-x-6 p-6 border border-slate-200 rounded-xl hover:border-[#0369a1] transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0369a1] focus:ring-offset-2"
            >
              <div className="bg-[#ebf5ff] p-4 rounded-full text-[#0369a1] group-hover:bg-[#0369a1] group-hover:text-white transition-colors duration-300">
                <FaUserTie className="text-2xl" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-medium text-slate-800">
                  I'm a Landlord
                </h3>
                <p className="text-slate-500 mt-1">
                  Manage your properties with premium tools
                </p>
              </div>
            </button>
          </div>

          <div className="px-8 pb-8 text-center text-sm text-slate-600 cursor-pointer">
            Already have an account?{" "}
            <a
              onClick={handleLogin}
              className="font-medium text-[#0369a1] hover:text-[#0284c7] transition-colors duration-300"
            >
              Sign in to your account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;