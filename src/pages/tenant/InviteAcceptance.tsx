import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "react-toastify";
import Select from "react-select";
import Button from "../../components/common/Button";
import { useAuthActions } from "@convex-dev/auth/react";

interface CountryOption {
  value: string;
  label: string;
}

const TenantInviteAcceptance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn } = useAuthActions();

  // Extract token from URL
  const queryParams = new URLSearchParams(location.search);
  const inviteToken = queryParams.get("token");

  // Multi-stepInvite state
  const [stepInvite, setstepInvite] = useState<
    | "loading"
    | "ip-detection"
    | "country-selection"
    | "disclaimer"
    | "account"
    | "confirmation"
    | "complete"
  >("loading");
  const [loading, setLoading] = useState(false);

  // Location data
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(
    null,
  );
  const [detectedCountry, setDetectedCountry] = useState("");
  const [ipAddress, setIpAddress] = useState("");

  // Disclaimer
  const [disclaimerContent, setDisclaimerContent] = useState("");
  const [hasScrolledDisclaimer, setHasScrolledDisclaimer] = useState(false);
  const disclaimerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<"signUp" | "signIn">("signIn");

  // Account creation
  const [isNewUser, setIsNewUser] = useState(true);
  const [accountData, setAccountData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Get tenancy details by invite token
  const tenancyDetails = useQuery(
    api.flows.tenantInviteAcceptance.getTenancyByToken,
    inviteToken ? { inviteToken } : "skip",
  );

  console.log("tenancyDetails", tenancyDetails);


  // Get current user
  const currentUser = useQuery(api.auth.getCurrentUser);

  // Get disclaimer content
  const disclaimerData = useQuery(
    api.services.disclaimers.getDisclaimerByRegion,
    selectedCountry
      ? {
        region: getRegionCode(selectedCountry.value),
        category: "tenant_invite_acceptance",
      }
      : "skip",
  );

  // Actions
  const detectIP = useAction(api.services.ipDetection.detectCountryFromIP);

  // Mutations
  const acceptInvite = useMutation(
    api.flows.tenantInviteAcceptance.acceptLandlordInvite,
  );
  const confirmTenancy = useMutation(
    api.flows.tenantInviteAcceptance.confirmTenancyDetails,
  );
  const logCompliance = useMutation(
    api.services.disclaimers.logDisclaimerAcceptance,
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



  // Get tenancy details by invite token
  useEffect(() => {
    if (tenancyDetails?.invitedTenantEmail) {
      setAccountData((prev) => ({
        ...prev,
        email: tenancyDetails.invitedTenantEmail ?? "", // ✅ fallback to empty string
      }));
    }
  }, [tenancyDetails]);


  // Initial validation and setup
  useEffect(() => {
    // Only run this initialization logic when we're still in the loading state
    if (stepInvite !== "loading") return;

    if (!inviteToken) {
      toast.error("Invalid invitation link");
      navigate("/login");
      return;
    }

    if (tenancyDetails === undefined) return; // Still loading

    if (!tenancyDetails) {
      toast.error("Invalid or expired invitation link");
      navigate("/login");
      return;
    }

    if (
      tenancyDetails.inviteTokenExpiry &&
      Date.now() > tenancyDetails.inviteTokenExpiry
    ) {
      toast.error("Invitation has expired");
      navigate("/login");
      return;
    }

    // Move to IP detection stepInvite
    setstepInvite("ip-detection");
  }, [tenancyDetails, inviteToken, navigate, stepInvite]);

  // IP Detection
  useEffect(() => {
    if (stepInvite === "ip-detection") {
      detectLocation();
    }
  }, [stepInvite]);

  const detectLocation = async () => {
    setLoading(true);
    try {
      // Get user's IP address
      let userIP = "";
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        userIP = ipData.ip || "127.0.0.1";
      } catch (error) {
        console.warn("Could not get IP address:", error);
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

        setstepInvite("country-selection");
      } else {
        // Fallback to manual country selection
        setstepInvite("country-selection");
      }
    } catch (error) {
      console.error("IP detection failed:", error);
      setstepInvite("country-selection");
    } finally {
      setLoading(false);
    }
  };

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
        // Fallback to common countries
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

    if (stepInvite === "country-selection") {
      loadCountries();
    }
  }, [stepInvite]);

  // Load disclaimer when country is selected
  useEffect(() => {
    if (disclaimerData) {
      setDisclaimerContent(disclaimerData.content);
    }
  }, [disclaimerData]);

  // Handle country confirmation
  const handleCountryConfirm = () => {
    if (!selectedCountry) {
      toast.error("Please select your country of residence");
      return;
    }
    setstepInvite("disclaimer");
  };

  // Handle disclaimer scroll
  const handleScroll = () => {
    if (disclaimerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = disclaimerRef.current;

      // If content fits without scrolling, automatically enable the button
      if (scrollHeight <= clientHeight) {
        setHasScrolledDisclaimer(true);
        return;
      }

      const scrolledPercentage =
        (scrollTop / (scrollHeight - clientHeight)) * 100;

      if (scrolledPercentage >= 95) {
        setHasScrolledDisclaimer(true);
      }
    }
  };

  // Check scroll on disclaimer content load
  useEffect(() => {
    if (disclaimerRef.current && stepInvite === "disclaimer") {
      handleScroll(); // Check immediately when disclaimer loads
    }
  }, [disclaimerContent, stepInvite]);

  // Handle disclaimer acceptance
  const handleDisclaimerAccept = async () => {
    if (!hasScrolledDisclaimer) {
      toast.error(
        "Please scroll through the entire disclaimer before accepting",
      );
      return;
    }

    setLoading(true);
    try {
      // Log disclaimer acceptance (only if user is available)
      let complianceLogId: string | undefined;
      if (currentUser?._id) {
        complianceLogId = await logCompliance({
          userId: currentUser._id,
          disclaimerVersionId: disclaimerData?._id,
          ipAddress,
          userAgent: navigator.userAgent,
          tenancyId: tenancyDetails?._id,
          region: selectedCountry ? getRegionCode(selectedCountry.value) : "US", // Fallback region
          category: "tenant_invite_acceptance", // Specify category
        });
      }

      // Check if user is logged in
      if (currentUser) {
        // User is already logged in, proceed to acceptance
        await handleInviteAcceptance(complianceLogId);
      } else {
        // Need to create account or login
        setstepInvite("account");
      }
    } catch (error) {
      console.error("Error logging compliance:", error);
      toast.error("Failed to log compliance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle account creation/login
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isNewUser) {
      // Account creation validation
      if (
        !accountData.firstName ||
        !accountData.lastName ||
        !accountData.email ||
        !accountData.password
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      if (accountData.password !== accountData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      if (accountData.password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
    } else {
      // Login validation
      if (!accountData.email || !accountData.password) {
        toast.error("Please enter your email and password");
        return;
      }
    }

    setLoading(true);
    try {
      if (isNewUser) {
        await signIn("password", {
          flow: "signUp",
          email: accountData.email,
          password: accountData.password,
          firstName: accountData.firstName,
          lastName: accountData.lastName,
          role: "tenant",
        });

        setstepInvite("confirmation");

        toast.success("Account created successfully!");
      } else {
        const result = await signIn("password", {
          flow: "signIn",
          email: accountData.email,
          password: accountData.password,
        });

        if (result.signingIn) {
          setstepInvite("confirmation");

          toast.success("Logged in successfully!");
        }
       
      }

      // Wait a moment for auth to settle, then accept the invitation
      setTimeout(async () => {
        // Now that user is authenticated, accept the invitation
        await handleInviteAcceptance();
      }, 1000);
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle invite acceptance
  const handleInviteAcceptance = async (disclaimerLogId?: string) => {
    if (!currentUser) {
      toast.error("You must be logged in to accept the invitation");
      return;
    }

    setLoading(true);
    try {
      const result = await acceptInvite({
        inviteToken: inviteToken!,
        tenantUserId: currentUser._id,
        tenantCountry: selectedCountry!.value,
        tenantRegion: getRegionCode(selectedCountry!.value),
        ipAddress,
        disclaimerLogId: disclaimerLogId as any,
      });

      if (result.success) {
        setstepInvite("confirmation");
      } else {
        toast.error(result.error || "Failed to accept invitation");
      }
    } catch (error: any) {
      console.error("Invite acceptance error:", error);
      toast.error(error.message || "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  // Handle tenancy confirmation
  const handleTenancyConfirmation = async (confirmed: boolean) => {
    setLoading(true);
    try {
      const result = await confirmTenancy({
        tenancyId: tenancyDetails!._id,
        confirmed,
        issues: confirmed ? undefined : "Tenant flagged details as incorrect",
      });

      if (result.success) {
        if (confirmed) {
          toast.success("Tenancy confirmed! Welcome to RentalCV!");
          setstepInvite("complete");
        } else {
          toast.info(
            "We've flagged this tenancy for review. Our team will investigate.",
          );
          navigate("/login");
        }
      } else {
        toast.error(result.error || "Failed to process confirmation");
      }
    } catch (error: any) {
      console.error("Tenancy confirmation error:", error);
      toast.error(error.message || "Failed to process confirmation");
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (stepInvite === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="container max-w-3xl mx-auto px-4 py-8 bg-white rounded-xl shadow">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                RentalCV Invitation
              </h1>
              <p className="text-gray-600">
                You've been invited to join RentalCV by your landlord
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span
                  className={
                    stepInvite === "ip-detection" || stepInvite === "country-selection"
                      ? "text-blue-600 font-medium"
                      : ""
                  }
                >
                  Location
                </span>
                <span
                  className={
                    stepInvite === "disclaimer" ? "text-blue-600 font-medium" : ""
                  }
                >
                  Terms
                </span>
                <span
                  className={
                    stepInvite === "account" ? "text-blue-600 font-medium" : ""
                  }
                >
                  Account
                </span>
                <span
                  className={
                    stepInvite === "confirmation" ? "text-blue-600 font-medium" : ""
                  }
                >
                  Confirm
                </span>
                <span
                  className={
                    stepInvite === "complete" ? "text-blue-600 font-medium" : ""
                  }
                >
                  Complete
                </span>
              </div>
              <div className="mt-2 h-1 bg-gray-200 rounded-full">
                <div
                  className="h-1 bg-blue-600 rounded-full transition-all duration-300"
                  style={{
                    width:
                      stepInvite === "ip-detection" || stepInvite === "country-selection"
                        ? "20%"
                        : stepInvite === "disclaimer"
                          ? "40%"
                          : stepInvite === "account"
                            ? "60%"
                            : stepInvite === "confirmation"
                              ? "80%"
                              : stepInvite === "complete"
                                ? "100%"
                                : "0%",
                  }}
                />
              </div>
            </div>

            {/* stepInvite Content */}
            {stepInvite === "ip-detection" && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold mb-2">
                  Detecting Your Location
                </h2>
                <p className="text-gray-600">
                  We're detecting your location to ensure legal compliance...
                </p>
              </div>
            )}

            {stepInvite === "country-selection" && (
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

                <Button
                  onClick={handleCountryConfirm}
                  disabled={!selectedCountry}
                  className="w-full"
                >
                  Continue
                </Button>
              </div>
            )}

            {stepInvite === "disclaimer" && (
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
                          RentalCV Terms of Service - Tenant
                        </h3>
                        <p className="mb-4">
                          By accepting this invitation and using RentalCV, you
                          agree to the following terms:
                        </p>
                        <ol className="list-decimal list-inside space-y-2">
                          <li>
                            You confirm that the tenancy information provided is
                            accurate
                          </li>
                          <li>
                            You consent to your landlord reviewing your tenancy
                          </li>
                          <li>
                            You understand that reviews will be publicly visible
                            on your profile
                          </li>
                          <li>
                            You agree to provide honest and factual information
                          </li>
                          <li>
                            You understand that false information may result in
                            account termination
                          </li>
                        </ol>
                        <p className="mt-4">
                          This agreement is governed by the laws of{" "}
                          {getRegionCode(selectedCountry?.value || "")}
                          and your data will be processed according to
                          applicable privacy laws.
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

                <Button
                  onClick={handleDisclaimerAccept}
                  disabled={!hasScrolledDisclaimer || loading}
                  className="w-full"
                >
                  {loading ? "Processing..." : "Accept & Continue"}
                </Button>
              </div>
            )}

            {stepInvite === "account" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  {isNewUser ? "Create Account" : "Sign In"}
                </h2>

                <div className="mb-4 flex bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setIsNewUser(true)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${isNewUser
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600"
                      }`}
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewUser(false)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${!isNewUser
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600"
                      }`}
                  >
                    Sign In
                  </button>
                </div>

                <form onSubmit={handleAccountSubmit}>
                  {isNewUser && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={accountData.firstName}
                          onChange={(e) =>
                            setAccountData((prev) => ({
                              ...prev,
                              firstName: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={accountData.lastName}
                          onChange={(e) =>
                            setAccountData((prev) => ({
                              ...prev,
                              lastName: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input name="flow" type="hidden" value={step} />

                    <input
                      type="email"
                      value={accountData.email}
                      onChange={(e) =>
                        setAccountData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 
                      disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"                      required
                      disabled
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={accountData.password}
                      onChange={(e) =>
                        setAccountData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {isNewUser && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        value={accountData.confirmPassword}
                        onChange={(e) =>
                          setAccountData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  )}

                  <Button type="submit" disabled={loading} className="w-full" >
                    {loading
                      ? "Processing..."
                      : isNewUser
                        ? "Create Account & Continue"
                        : "Sign In & Continue"}
                  </Button>
                </form>
              </div>
            )}

            {stepInvite === "confirmation" && tenancyDetails && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Confirm Tenancy Details
                </h2>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Property Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Address:</strong>{" "}
                      {tenancyDetails.property?.addressLine1}
                    </p>
                    <p>
                      <strong>Landlord:</strong>{" "}
                      {tenancyDetails.landlord?.firstName}{" "}
                      {tenancyDetails.landlord?.lastName}
                    </p>
                    {tenancyDetails.landlord?.verified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Verified Landlord
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 mt-4 mb-3">
                    Tenancy Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Start Date:</strong>{" "}
                      {new Date(tenancyDetails.startDate).toLocaleDateString()}
                    </p>
                    {tenancyDetails.endDate && (
                      <p>
                        <strong>End Date:</strong>{" "}
                        {new Date(tenancyDetails.endDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    Please review the above information carefully. Are these
                    details correct?
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => handleTenancyConfirmation(true)}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading
                      ? "Processing..."
                      : "Confirm - Details are Correct"}
                  </Button>

                  <Button
                    onClick={() => handleTenancyConfirmation(false)}
                    disabled={loading}
                    className="flex-1 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Flag as Incorrect
                  </Button>
                </div>
              </div>
            )}

            {stepInvite === "complete" && (
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
                  Welcome to RentalCV!
                </h2>

                <p className="text-gray-600 mb-6">
                  Your tenancy has been confirmed and your landlord will be
                  notified. You can now start building your verified rental
                  history.
                </p>

                <Button
                  onClick={() => navigate("/home")}
                  className="w-full sm:w-auto"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantInviteAcceptance;
