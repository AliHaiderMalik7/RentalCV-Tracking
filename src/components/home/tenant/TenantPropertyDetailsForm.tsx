import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "react-toastify";
import Select from "react-select";
import InputField from "../../common/InputField";
import Button from "../../common/Button";

interface TenantPropertyDetailsFormProps {
  onClose?: () => void;
}

interface FormData {
  propertyAddress: string;
  unitNumber: string;
  landlordName: string;
  landlordEmail: string;
  landlordPhone: string;
  tenancyStartDate: string;
  tenancyEndDate: string;
  monthlyRent: string;
  depositAmount: string;
}

interface CountryOption {
  value: string;
  label: string;
}

const TenantPropertyDetailsForm = ({
  onClose,
}: TenantPropertyDetailsFormProps) => {
  const navigate = useNavigate();
  const currentUser = useQuery(api.auth.getCurrentUser);

  // Multi-step form state
  const [step, setStep] = useState<
    "details" | "country" | "disclaimer" | "sending" | "complete"
  >("details");

  // Form data
  const [formData, setFormData] = useState<FormData>({
    propertyAddress: "",
    unitNumber: "",
    landlordName: "",
    landlordEmail: "",
    landlordPhone: "",
    tenancyStartDate: "",
    tenancyEndDate: "",
    monthlyRent: "",
    depositAmount: "",
  });

  // Location and disclaimer state
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(
    null,
  );
  const [detectedCountry, setDetectedCountry] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [disclaimerContent, setDisclaimerContent] = useState("");
  const [hasScrolledDisclaimer, setHasScrolledDisclaimer] = useState(false);

  const disclaimerRef = useRef<HTMLDivElement>(null);

  // Actions and Mutations
  const detectIP = useAction(api.services.ipDetection.detectCountryFromIP);
  const createTenantRequest = useMutation(
    api.flows.tenantInitiatedRequest.createTenantRequest,
  );
  const sendLandlordInvite = useAction(
    api.flows.tenantInitiatedRequest.sendLandlordInvite,
  );
  const logCompliance = useMutation(
    api.services.disclaimers.logDisclaimerAcceptance,
  );

  // Get disclaimer content based on country
  const disclaimerData = useQuery(
    api.services.disclaimers.getDisclaimerByRegion,
    selectedCountry
      ? {
          region: getRegionCode(selectedCountry.value),
          category: "tenant_initiated_request",
        }
      : "skip",
  );

  // Helper function to map countries to regions
  function getRegionCode(
    country: string,
  ): "US" | "UK" | "EU" | "INTERNATIONAL" {
    const regions: Record<string, "US" | "UK" | "EU" | "INTERNATIONAL"> = {
      "United States": "US",
      "United Kingdom": "UK",
      Germany: "EU",
      France: "EU",
      Spain: "EU",
      Italy: "EU",
      Netherlands: "EU",
      Belgium: "EU",
      Austria: "EU",
      Portugal: "EU",
      Poland: "EU",
      Sweden: "EU",
      Denmark: "EU",
      Finland: "EU",
      Ireland: "EU",
    };
    return regions[country] || "INTERNATIONAL";
  }

  // Load countries list
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name",
        );
        const data = await response.json();
        const countryOptions = data
          .map((country: any) => ({
            value: country.name.common,
            label: country.name.common,
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));

        setCountries(countryOptions);
      } catch (error) {
        console.error("Failed to load countries:", error);
        // Fallback countries
        setCountries([
          { value: "United States", label: "United States" },
          { value: "United Kingdom", label: "United Kingdom" },
          { value: "Germany", label: "Germany" },
          { value: "France", label: "France" },
          { value: "Spain", label: "Spain" },
          { value: "Italy", label: "Italy" },
          { value: "Netherlands", label: "Netherlands" },
        ]);
      }
    };

    loadCountries();
  }, []);

  // IP Detection for country suggestion
  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Get user's IP address
        let userIP = "";
        try {
          const ipResponse = await fetch("https://api.ipify.org?format=json");
          const ipData = await ipResponse.json();
          userIP = ipData.ip || "127.0.0.1";
        } catch (error) {
          userIP = "127.0.0.1";
        }

        setIpAddress(userIP);

        // Use our backend IP detection service
        const detectionResult = await detectIP({ ipAddress: userIP });

        if (detectionResult.success && detectionResult.country) {
          setDetectedCountry(detectionResult.country);

          // Auto-select detected country
          const detectedOption = {
            value: detectionResult.country,
            label: detectionResult.country,
          };
          setSelectedCountry(detectedOption);
        }
      } catch (error) {
        console.error("IP detection failed:", error);
      }
    };

    if (step === "country") {
      detectLocation();
    }
  }, [step, detectIP]);

  // Load disclaimer when country is selected
  useEffect(() => {
    if (disclaimerData) {
      setDisclaimerContent(disclaimerData.content);
    }
  }, [disclaimerData]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Step 1: Property & Landlord Details
  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.propertyAddress.trim()) {
      toast.error("Please enter the property address");
      return;
    }

    if (!formData.landlordName.trim()) {
      toast.error("Please enter your landlord's name");
      return;
    }

    if (!formData.landlordEmail.trim()) {
      toast.error("Please enter your landlord's email");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.landlordEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!formData.tenancyStartDate) {
      toast.error("Please select the tenancy start date");
      return;
    }

    // Check for duplicate property entries (basic check)
    if (formData.propertyAddress.length < 10) {
      toast.error("Please enter a complete property address");
      return;
    }

    setStep("country");
  };

  // Step 2: Country Confirmation
  const handleCountryConfirm = () => {
    if (!selectedCountry) {
      toast.error("Please select your country of residence");
      return;
    }
    setStep("disclaimer");
  };

  // Handle disclaimer scroll
  const handleScroll = () => {
    if (disclaimerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = disclaimerRef.current;
      const scrolledPercentage =
        (scrollTop / (scrollHeight - clientHeight)) * 100;

      if (scrolledPercentage >= 95) {
        setHasScrolledDisclaimer(true);
      }
    }
  };

  // Step 3: Legal Disclaimer Acceptance
  const handleDisclaimerAccept = async () => {
    if (!hasScrolledDisclaimer) {
      toast.error(
        "Please scroll through the entire disclaimer before accepting",
      );
      return;
    }

    if (!currentUser) {
      toast.error("You must be logged in to create a request");
      return;
    }

    setLoading(true);
    setStep("sending");

    try {
      // Log disclaimer acceptance
      const complianceLogId = await logCompliance({
        userId: currentUser._id,
        disclaimerVersionId: disclaimerData?._id,
        ipAddress,
        userAgent: navigator.userAgent,
        region: selectedCountry ? getRegionCode(selectedCountry.value) : "US", // Fallback region
        category: "tenant_initiated_request", // Specify category
      });

      // Create tenant request
      const requestResult = await createTenantRequest({
        tenantId: currentUser._id,
        propertyAddress: formData.propertyAddress,
        unitNumber: formData.unitNumber || undefined,
        landlordName: formData.landlordName,
        landlordEmail: formData.landlordEmail,
        landlordPhone: formData.landlordPhone || undefined,
        tenancyStartDate: new Date(formData.tenancyStartDate).getTime(),
        tenancyEndDate: formData.tenancyEndDate
          ? new Date(formData.tenancyEndDate).getTime()
          : undefined,
        monthlyRent: formData.monthlyRent
          ? parseFloat(formData.monthlyRent)
          : undefined,
        depositAmount: formData.depositAmount
          ? parseFloat(formData.depositAmount)
          : undefined,
        tenantCountry: selectedCountry!.value,
        tenantRegion: getRegionCode(selectedCountry!.value),
        ipAddress,
        disclaimerLogId: complianceLogId as any,
      });

      if (!requestResult.success) {
        throw new Error(requestResult.error || "Failed to create request");
      }

      // Send landlord invitation
      const inviteResult = await sendLandlordInvite({
        tenancyId: requestResult.tenancyId!,
      });

      if (!inviteResult.success) {
        console.warn("Failed to send landlord invitation:", inviteResult.error);
        toast.warning(
          "Request created, but failed to send email to landlord. Please contact support.",
        );
      }

      setStep("complete");
      toast.success("Landlord invitation sent successfully!");
    } catch (error: any) {
      console.error("Error creating tenant request:", error);
      toast.error(
        error.message || "Failed to create request. Please try again.",
      );
      setStep("disclaimer"); // Go back to disclaimer step
    } finally {
      setLoading(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (step === "country") setStep("details");
    else if (step === "disclaimer") setStep("country");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Add Your Tenancy
              </h1>
              <p className="text-gray-600">
                Invite your landlord to verify your tenancy and get your first
                review
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span
                  className={
                    step === "details" ? "text-blue-600 font-medium" : ""
                  }
                >
                  Property Details
                </span>
                <span
                  className={
                    step === "country" ? "text-blue-600 font-medium" : ""
                  }
                >
                  Country
                </span>
                <span
                  className={
                    step === "disclaimer" ? "text-blue-600 font-medium" : ""
                  }
                >
                  Legal Terms
                </span>
                <span
                  className={
                    step === "sending" || step === "complete"
                      ? "text-blue-600 font-medium"
                      : ""
                  }
                >
                  Send Invite
                </span>
              </div>
              <div className="mt-2 h-1 bg-gray-200 rounded-full">
                <div
                  className="h-1 bg-blue-600 rounded-full transition-all duration-300"
                  style={{
                    width:
                      step === "details"
                        ? "25%"
                        : step === "country"
                          ? "50%"
                          : step === "disclaimer"
                            ? "75%"
                            : step === "sending" || step === "complete"
                              ? "100%"
                              : "0%",
                  }}
                />
              </div>
            </div>

            {/* Step Content */}
            {step === "details" && (
              <form onSubmit={handleDetailsSubmit}>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      Property & Landlord Details
                    </h2>

                    <div className="grid grid-cols-1 gap-6">
                      <InputField
                        label="Property Address"
                        name="propertyAddress"
                        value={formData.propertyAddress}
                        onChange={handleInputChange}
                        placeholder="e.g., 123 Main Street, Apartment Building Name"
                        required
                      />

                      <InputField
                        label="Unit Number (Optional)"
                        name="unitNumber"
                        value={formData.unitNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., Apt 4B, Unit 12, Flat 3"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                          label="Landlord Name"
                          name="landlordName"
                          value={formData.landlordName}
                          onChange={handleInputChange}
                          placeholder="Full name"
                          required
                        />

                        <InputField
                          label="Landlord Email"
                          name="landlordEmail"
                          type="email"
                          value={formData.landlordEmail}
                          onChange={handleInputChange}
                          placeholder="landlord@example.com"
                          required
                        />
                      </div>

                      <InputField
                        label="Landlord Phone (Optional)"
                        name="landlordPhone"
                        type="tel"
                        value={formData.landlordPhone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Tenancy Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <InputField
                        label="Tenancy Start Date"
                        name="tenancyStartDate"
                        type="date"
                        value={formData.tenancyStartDate}
                        onChange={handleInputChange}
                        required
                      />

                      <InputField
                        label="Expected End Date (Optional)"
                        name="tenancyEndDate"
                        type="date"
                        value={formData.tenancyEndDate}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        label="Monthly Rent (Optional)"
                        name="monthlyRent"
                        type="number"
                        value={formData.monthlyRent}
                        onChange={handleInputChange}
                        placeholder="1200.00"
                        // step="0.01"
                        // min="0"
                      />

                      <InputField
                        label="Deposit Amount (Optional)"
                        name="depositAmount"
                        type="number"
                        value={formData.depositAmount}
                        onChange={handleInputChange}
                        placeholder="2400.00"
                        // step="0.01"
                        // min="0"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      What happens next?
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• We'll send a free invitation to your landlord</li>
                      <li>
                        • Your landlord can review you to help build your
                        RentalCV
                      </li>
                      <li>
                        • Your landlord can choose whether to be reviewed back
                      </li>
                      <li>• This helps you stand out to future landlords</li>
                    </ul>
                  </div>

                  <Button type="submit" className="w-full">
                    Continue
                  </Button>
                </div>
              </form>
            )}

            {step === "country" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Confirm Your Country
                </h2>

                {detectedCountry && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Detected Location:</strong> {detectedCountry}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Please confirm or select your correct country of residence
                      for legal compliance
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country of Residence *
                  </label>
                  <Select
                    value={selectedCountry}
                    onChange={setSelectedCountry}
                    options={countries}
                    placeholder="Select your country..."
                    isSearchable
                    className="mb-4"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleBack}
                    // variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCountryConfirm}
                    disabled={!selectedCountry}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === "disclaimer" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Legal Disclaimer</h2>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Please read and scroll through the entire disclaimer before
                    accepting:
                  </p>

                  <div
                    ref={disclaimerRef}
                    onScroll={handleScroll}
                    className="h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50 text-sm"
                  >
                    {disclaimerContent || (
                      <div>
                        <h3 className="font-semibold mb-2">
                          RentalCV Terms - Tenant-Initiated Request
                        </h3>
                        <p className="mb-4">
                          By submitting this landlord invitation request, you
                          agree to:
                        </p>
                        <ol className="list-decimal list-inside space-y-2">
                          <li>
                            Provide accurate property and landlord information
                          </li>
                          <li>
                            Consent to your landlord reviewing your tenancy
                            performance
                          </li>
                          <li>
                            Allow your landlord to choose whether to be reviewed
                            in return
                          </li>
                          <li>
                            Understand that your first review through this
                            process is free for your landlord
                          </li>
                          <li>
                            Acknowledge that reviews will be visible on your
                            public RentalCV profile
                          </li>
                          <li>
                            Take responsibility for any false or misleading
                            information provided
                          </li>
                        </ol>
                        <p className="mt-4">
                          <strong>Important:</strong> Your landlord will have
                          the choice to:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>
                            Review you only (they don't get reviewed back)
                          </li>
                          <li>
                            Engage in mutual reviews (both review each other)
                          </li>
                        </ul>
                        <p className="mt-4">
                          This agreement is governed by the laws of{" "}
                          {getRegionCode(selectedCountry?.value || "")}
                          and your data will be processed according to
                          applicable privacy regulations.
                        </p>
                      </div>
                    )}
                  </div>

                  {!hasScrolledDisclaimer && (
                    <p className="text-xs text-amber-600 mt-2">
                      ⚠️ Please scroll to the bottom to continue
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleBack}
                    // variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleDisclaimerAccept}
                    disabled={!hasScrolledDisclaimer || loading}
                    className="flex-1"
                  >
                    {loading ? "Processing..." : "Accept & Send Invitation"}
                  </Button>
                </div>
              </div>
            )}

            {step === "sending" && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold mb-2">
                  Sending Invitation
                </h2>
                <p className="text-gray-600">
                  We're creating your request and sending an invitation to your
                  landlord...
                </p>
              </div>
            )}

            {step === "complete" && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Invitation Sent!
                </h2>

                <div className="text-left bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold mb-3">What happens next:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Your landlord will receive an email invitation</li>
                    <li>
                      They'll create an account and verify the property details
                    </li>
                    <li>Your landlord will choose their review preferences</li>
                    <li>
                      They'll submit a review for your tenancy (free for them!)
                    </li>
                    <li>You'll be notified once the review is published</li>
                  </ol>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your landlord has 14 days to respond
                    to the invitation. If they don't respond, you can send
                    another invitation or contact support.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => navigate("/home")} className="flex-1">
                    Go to Dashboard
                  </Button>
                  {onClose && (
                    <Button
                      onClick={onClose}
                      // variant="outline"
                      className="flex-1"
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantPropertyDetailsForm;
