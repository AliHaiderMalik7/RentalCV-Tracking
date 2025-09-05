import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import TenantPropertyDetailsForm from "@/components/home/tenant/TenantPropertyDetailsForm";
import Button from "@/components/common/Button";

const TenantOnboarding = () => {
  const navigate = useNavigate();
  const currentUser = useQuery(api.auth.getCurrentUser);
  const userId = currentUser?._id;
  const [showPropertyForm, setShowPropertyForm] = useState(false);

  if (!userId) {
    navigate("/login");
    return null;
  }

  const handleSkipForNow = () => {
    navigate("/tenant/dashboard");
  };

  const handleAddProperty = () => {
    setShowPropertyForm(true);
  };

  const handleFormClose = () => {
    navigate("/tenant/dashboard");
  };

  if (showPropertyForm) {
    return <TenantPropertyDetailsForm onClose={handleFormClose} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to RentalCV!
            </h1>
            <p className="text-gray-600 text-lg">
              Your account has been created successfully
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">
              Ready to build your RentalCV?
            </h2>
            <p className="text-blue-700 mb-6">
              Add your property details and invite your current landlord to
              leave your first review -
              <strong> it's completely FREE for them!</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  ✅ For You:
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Get your first verified review</li>
                  <li>• Build your rental history</li>
                  <li>• Stand out to future landlords</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  🎁 For Your Landlord:
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• First review is FREE</li>
                  <li>• Simple verification process</li>
                  <li>• Optional to be reviewed back</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleAddProperty}
              className="w-full py-4 text-lg font-semibold"
            >
              Add Property & Invite Landlord
            </Button>

            <button
              onClick={handleSkipForNow}
              className="w-full py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Skip for now, I'll do this later
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-sm text-gray-500">
            <p>
              Don't worry - you can always add properties and invite landlords
              later from your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantOnboarding;
