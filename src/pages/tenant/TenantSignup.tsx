import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "react-toastify";
import Select from "react-select";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";

interface CountryOption {
  value: string;
  label: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

const TenantSignup = () => {
  const navigate = useNavigate();
  const { signIn } = useAuthActions();
  const currentUser = useQuery(api.auth.getCurrentUser);

  // State management
  const [step, setStep] = useState<"details" | "country" | "2fa" | "complete">(
    "details",
  );
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(
    null,
  );
  const [detectedCountry, setDetectedCountry] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mutations
  const generateVerificationCode = useMutation(
    api.services.verification.generateVerificationCode,
  );
  const verifyCode = useMutation(api.services.verification.verifyCode);

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
          .sort((a: CountryOption, b: CountryOption) =>
            a.label.localeCompare(b.label),
          );
        setCountries(countryOptions);
      } catch (error) {
        console.error("Failed to load countries:", error);
        setCountries([
          { value: "United States", label: "United States" },
          { value: "United Kingdom", label: "United Kingdom" },
          { value: "Germany", label: "Germany" },
          { value: "France", label: "France" },
        ]);
      }
    };

    loadCountries();
  }, []);

  // IP-based country detection
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        if (data.country_name) {
          setDetectedCountry(data.country_name);
          setIpAddress(data.ip);

          // Auto-select detected country
          const detectedOption = {
            value: data.country_name,
            label: data.country_name,
          };
          setSelectedCountry(detectedOption);
        }
      } catch (error) {
        console.log("Could not detect location automatically");
      }
    };

    if (step === "country") {
      detectLocation();
    }
  }, [step]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate step 1 form
  const validateDetailsForm = () => {
    const { firstName, lastName, email, mobile, password, confirmPassword } =
      formData;

    if (!firstName.trim()) {
      toast.error("First name is required");
      return false;
    }

    if (!lastName.trim()) {
      toast.error("Last name is required");
      return false;
    }

    if (!email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!mobile.trim()) {
      toast.error("Mobile number is required");
      return false;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  // Handle step 1 completion
  const handleDetailsNext = () => {
    if (!validateDetailsForm()) return;
    setStep("country");
  };

  // Handle country selection completion
  const handleCountryNext = () => {
    if (!selectedCountry) {
      toast.error("Please select your country of residence");
      return;
    }
    setStep("2fa");
  };

  // Handle account creation and 2FA
  const handleCreateAccount = async () => {
    if (!selectedCountry) {
      toast.error("Please select your country of residence");
      return;
    }

    try {
      setLoading(true);

      // Create account
      await signIn("password", {
        email: formData.email,
        password: formData.password,
        flow: "signUp",
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: "tenant",
      });

      toast.success("Account created successfully!");

      // Wait a moment for auth to settle, then proceed to 2FA
      setTimeout(async () => {
        if (currentUser) {
          // Account created successfully, now send 2FA code
          try {
            await generateVerificationCode({
              userId: currentUser._id,
              type: "email_verification",
              method: "email",
              ipAddress,
              userAgent: navigator.userAgent,
            });

            toast.success("Please check your email for the verification code.");
            setStep("2fa");
          } catch (error) {
            console.error("Failed to send verification code:", error);
            toast.error("Failed to send verification code. Please try again.");
          }
        }
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA verification
  const handleVerify2FA = async () => {
    if (!verificationCode.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    try {
      setLoading(true);

      if (!currentUser) {
        toast.error("Please log in first");
        return;
      }

      const result = await verifyCode({
        userId: currentUser._id,
        code: verificationCode,
        type: "email_verification",
      });

      if (result.success) {
        toast.success("Email verified successfully!");
        setStep("complete");

        // Redirect to tenant property details form after brief delay
        setTimeout(() => {
          navigate("/tenant/add-property");
        }, 2000);
      } else {
        toast.error(result.error || "Invalid verification code");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">
              Create Your Tenant Account
            </h1>
            <p className="text-green-100 mt-1">
              Join RentalCV to build your rental history
            </p>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center">
              {["details", "country", "2fa", "complete"].map(
                (stepName, index) => (
                  <div key={stepName} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step === stepName
                          ? "bg-green-600 text-white"
                          : ["details", "country", "2fa"].indexOf(step) > index
                            ? "bg-green-600 text-white"
                            : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    {index < 3 && (
                      <div className="w-12 h-1 bg-gray-300 mx-2"></div>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Personal Details */}
            {step === "details" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Personal Details
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Please enter your personal information to create your tenant
                    account.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <InputField
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <InputField
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <InputField
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number *
                  </label>
                  <InputField
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <InputField
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password"
                    required
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500"
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 8 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <InputField
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    required
                    rightIcon={
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-gray-500"
                      >
                        {showConfirmPassword ? "🙈" : "👁️"}
                      </button>
                    }
                  />
                </div>

                <Button
                  onClick={handleDetailsNext}
                  className="w-full bg-green-600 text-white py-3 rounded-lg"
                >
                  Continue to Location
                </Button>
              </div>
            )}

            {/* Step 2: Country Selection */}
            {step === "country" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Confirm Your Location
                  </h2>
                  <p className="text-gray-600 mb-6">
                    We need to confirm your country of residence for legal
                    compliance purposes.
                  </p>
                </div>

                {detectedCountry && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-green-600 mr-2">✓</div>
                      <p className="text-green-800">
                        Detected location: <strong>{detectedCountry}</strong>{" "}
                        (IP: {ipAddress})
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country of Residence *
                  </label>
                  <Select
                    options={countries}
                    value={selectedCountry}
                    onChange={setSelectedCountry}
                    placeholder="Select your country..."
                    isSearchable
                    className="react-select-container"
                  />
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={() => setStep("details")}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCountryNext}
                    disabled={!selectedCountry}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg disabled:bg-gray-300"
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: 2FA Verification */}
            {step === "2fa" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Email Verification
                  </h2>
                  <p className="text-gray-600 mb-6">
                    We've sent a verification code to{" "}
                    <strong>{formData.email}</strong>. Please enter the 6-digit
                    code below.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code *
                  </label>
                  <input
                    type="text"
                    name="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full py-3 border-1 border-black rounded-lg focus:outline-none bg-transparent transition-colors duration-300 placeholder-slate-400 text-center text-2xl tracking-widest"
                  />
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleCreateAccount}
                    disabled={loading}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    {loading ? "Sending..." : "Resend Code"}
                  </button>
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={() => setStep("country")}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleVerify2FA}
                    disabled={!verificationCode.trim() || loading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg disabled:bg-gray-300"
                  >
                    {loading ? "Verifying..." : "Verify & Continue"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Complete */}
            {step === "complete" && (
              <div className="space-y-6 text-center">
                <div className="text-6xl">✅</div>
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Account Created Successfully!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Welcome to RentalCV, {formData.firstName}! Your account has
                    been created and verified.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    Redirecting you to add your property details...
                  </p>
                </div>

                <Button
                  onClick={() => navigate("/tenant/add-property")}
                  className="w-full bg-green-600 text-white py-3 rounded-lg"
                >
                  Continue to Property Details
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantSignup;
