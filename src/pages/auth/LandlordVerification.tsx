import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
// import InputField from "@/components/common/InputField";
import Button from "@/components/common/Button";
import { toast } from "react-toastify";

interface LandlordVerificationProps {}

const LandlordVerification = ({}: LandlordVerificationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useQuery(api.auth.getCurrentUser);
  const userId = currentUser?._id;

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    country: "",
    agreeToReview: false,
    agreeToBeReviewed: false,
  });

  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const inviteDetails = useQuery(
    api.tenancy.getLandlordInviteDetails,
    token ? { token } : "skip",
  );

  const acceptInvite = useMutation(api.tenancy.acceptLandlordInvite);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid invitation link");
      navigate("/login");
      return;
    }

    // Load countries and detect user's country
    const loadCountries = async () => {
      setCountries([
        "United States",
        "United Kingdom",
        "Canada",
        "Australia",
        "Germany",
        "France",
        "Other",
      ]);

      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          country: data.country_name || "United States",
        }));
      } catch (error) {
        console.error("Error detecting country:", error);
        setFormData((prev) => ({ ...prev, country: "United States" }));
      }
    };

    loadCountries();
  }, [token, navigate]);

  useEffect(() => {
    if (inviteDetails && !inviteDetails.success) {
      toast.error(inviteDetails.error || "Invalid or expired invitation");
      navigate("/login");
    }
  }, [inviteDetails, navigate]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    setFormData((prev) => ({ ...prev, country }));

    if (country !== "") {
      setShowDisclaimer(true);
    }
  };

  const handleCheckboxChange = (
    field: "agreeToReview" | "agreeToBeReviewed",
  ) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleDisclaimerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      setHasScrolledToBottom(true);
    }
  };

  const getDisclaimerText = (country: string) => {
    switch (country) {
      case "United Kingdom":
        return `
          UK Legal Disclaimer for Landlords:
          
          By using RentalCV.ai as a landlord, you acknowledge that:
          1. You will provide honest and accurate reviews of tenants
          2. Reviews must be based on factual tenancy experiences
          3. You understand your responsibilities under UK housing laws
          4. Discriminatory or defamatory content is prohibited
          5. Data will be retained for 7 years minimum for legal compliance
          6. Tenants have the right to dispute inaccurate information
          
          This disclaimer is governed by UK law and subject to UK jurisdiction.
        `;
      case "United States":
        return `
          US Legal Disclaimer for Landlords:
          
          By using RentalCV.ai as a landlord, you acknowledge that:
          1. Reviews must comply with Fair Housing laws and regulations
          2. Discriminatory content based on protected classes is prohibited
          3. Reviews should be factual and based on actual tenancy experiences
          4. You may be held liable for false or defamatory statements
          5. Data retention follows US compliance requirements (7 years minimum)
          6. State-specific landlord-tenant laws may apply
          
          This service is provided "as is" under US jurisdiction.
        `;
      default:
        return `
          International Legal Disclaimer for Landlords:
          
          By using RentalCV.ai as a landlord, you acknowledge that:
          1. Reviews must be honest, accurate, and non-discriminatory
          2. You will comply with applicable local housing and privacy laws
          3. False or defamatory content may result in legal consequences
          4. You have responsibilities under applicable data protection laws
          5. Data will be retained as required by law (minimum 7 years)
          6. Terms may vary by jurisdiction
          
          Please consult local laws regarding landlord responsibilities.
        `;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("Please log in to continue");
      navigate("/login");
      return;
    }

    if (!token) {
      toast.error("Invalid invitation token");
      return;
    }

    if (!formData.country) {
      toast.error("Please select your country");
      return;
    }

    if (!formData.agreeToReview) {
      toast.error("You must agree to provide a review for this tenant");
      return;
    }

    if (!disclaimerAccepted) {
      toast.error("Please read and accept the legal disclaimer");
      return;
    }

    setLoading(true);

    try {
      // Get user's IP and device info
      const ip = await fetch("https://api.ipify.org?format=json")
        .then((res) => res.json())
        .then((data) => data.ip)
        .catch(() => "127.0.0.1");

      const device = navigator.userAgent;

      const result = await acceptInvite({
        token,
        landlordId: userId,
        landlordCountry: formData.country,
        disclaimerVersion: "v1.0",
        ip,
        device,
        agreeToReview: formData.agreeToReview,
        agreeToBeReviewed: formData.agreeToBeReviewed,
      });

      if (result.success) {
        toast.success(
          "Tenancy verified successfully! You can now leave a review for your tenant.",
        );
        navigate(`/landlord/review-tenant?tenancyId=${result.tenancyId}`);
      } else {
        toast.error(result.error || "Failed to verify tenancy");
      }
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!inviteDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (!inviteDetails.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Invalid Invitation
          </h2>
          <p className="text-gray-600 mb-4">{inviteDetails.error}</p>
          <Button onClick={() => navigate("/login")}>Return to Login</Button>
        </div>
      </div>
    );
  }

  const { tenancy, property } = inviteDetails;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Landlord Verification
            </h1>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
              <p className="text-green-800 font-semibold">
                🎉 This first review is FREE for you!
              </p>
            </div>
          </div>
        </div>

        {/* Invitation Details */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Tenancy Verification Request
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3">
                Property Details
              </h3>
              <p>
                <strong>Address:</strong> {property?.addressLine1}
              </p>
              <p>
                <strong>City:</strong> {property?.city}
              </p>
              <p>
                <strong>Postal Code:</strong> {property?.postcode}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3">
                Tenancy Information
              </h3>
              <p>
                <strong>Start Date:</strong>{" "}
                {tenancy?.startDate
                  ? new Date(tenancy.startDate).toLocaleDateString()
                  : "N/A"}
              </p>
              {tenancy?.endDate && (
                <p>
                  <strong>End Date:</strong>{" "}
                  {new Date(tenancy.endDate).toLocaleDateString()}
                </p>
              )}
              {tenancy?.monthlyRent && (
                <p>
                  <strong>Monthly Rent:</strong> ${tenancy.monthlyRent}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Complete Your Verification
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Country Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country of Residence *
              </label>
              <select
                value={formData.country}
                onChange={handleCountryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Please select your country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Review Choice Options */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                Review Options
              </h3>

              <div className="space-y-4">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.agreeToReview}
                    onChange={() => handleCheckboxChange("agreeToReview")}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="font-semibold text-blue-800">
                      ✅ I agree to provide a review for this tenant (required)
                    </span>
                    <p className="text-blue-600 text-sm mt-1">
                      This helps build their RentalCV profile and is completely
                      free for you.
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.agreeToBeReviewed}
                    onChange={() => handleCheckboxChange("agreeToBeReviewed")}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="font-semibold text-gray-700">
                      ☐ I also agree to be reviewed by this tenant (optional)
                    </span>
                    <p className="text-gray-600 text-sm mt-1">
                      This creates a mutual review relationship and helps build
                      your landlord reputation.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Legal Disclaimer */}
            {showDisclaimer && (
              <div className="border border-gray-300 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Legal Disclaimer</h3>
                <div
                  className="bg-gray-50 p-4 rounded border h-64 overflow-y-auto text-sm"
                  onScroll={handleDisclaimerScroll}
                >
                  <pre className="whitespace-pre-wrap font-sans">
                    {getDisclaimerText(formData.country)}
                  </pre>
                </div>

                {hasScrolledToBottom && (
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={disclaimerAccepted}
                        onChange={(e) =>
                          setDisclaimerAccepted(e.target.checked)
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">
                        I have read and accept the legal disclaimer above
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  loading ||
                  !disclaimerAccepted ||
                  !hasScrolledToBottom ||
                  !formData.agreeToReview
                }
                // loading={loading}
                className="px-8 py-3"
              >
                Verify Tenancy & Continue to Review
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LandlordVerification;
