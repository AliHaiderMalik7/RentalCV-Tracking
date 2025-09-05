// import { useState, useEffect, useRef } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useQuery, useMutation, useAction } from "convex/react";
// import { useAuthActions } from "@convex-dev/auth/react";
// import { api } from "../../../convex/_generated/api";
// import { toast } from "react-toastify";
// import Select from "react-select";
// import InputField from "../../components/common/InputField";
// import Button from "../../components/common/Button";

// interface CountryOption {
//   value: string;
//   label: string;
// }

// interface ReviewChoices {
//   agreeToReview: boolean;
//   agreeToBeReviewed: boolean;
// }

// interface ReviewFormData {
//   cleanliness: number;
//   communication: number;
//   paymentPunctuality: number;
//   propertyRespect: number;
//   overallExperience: number;
//   wouldRecommend: boolean;
//   comments: string;
// }

// const LandlordOnboarding = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { signUp, signIn } = useAuthActions();

//   // Extract token from URL
//   const queryParams = new URLSearchParams(location.search);
//   const inviteToken = queryParams.get("token");

//   // Multi-step state
//   const [step, setStep] = useState<
//     | "loading"
//     | "account"
//     | "country"
//     | "disclaimer"
//     | "review-choice"
//     | "review-form"
//     | "complete"
//   >("loading");
//   const [loading, setLoading] = useState(false);

//   // Account creation
//   const [isNewUser, setIsNewUser] = useState(true);
//   const [accountData, setAccountData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     mobile: "",
//     password: "",
//     confirmPassword: "",
//   });

//   // Location data
//   const [countries, setCountries] = useState<CountryOption[]>([]);
//   const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(
//     null,
//   );
//   const [detectedCountry, setDetectedCountry] = useState("");
//   const [ipAddress, setIpAddress] = useState("");

//   // Disclaimer
//   const [disclaimerContent, setDisclaimerContent] = useState("");
//   const [hasScrolledDisclaimer, setHasScrolledDisclaimer] = useState(false);
//   const disclaimerRef = useRef<HTMLDivElement>(null);

//   // Review choices and form
//   const [reviewChoices, setReviewChoices] = useState<ReviewChoices>({
//     agreeToReview: false, // This will be required
//     agreeToBeReviewed: false, // This is optional for tenant-initiated
//   });

//   const [reviewForm, setReviewForm] = useState<ReviewFormData>({
//     cleanliness: 5,
//     communication: 5,
//     paymentPunctuality: 5,
//     propertyRespect: 5,
//     overallExperience: 5,
//     wouldRecommend: true,
//     comments: "",
//   });

//   // Get tenancy details by invite token
//   const tenancyDetails = useQuery(
//     api.flows.landlordVerification.getTenancyByToken,
//     inviteToken ? { inviteToken } : "skip",
//   );

//   // Get current user
//   const currentUser = useQuery(api.auth.getCurrentUser);

//   // Get disclaimer content
//   const disclaimerData = useQuery(
//     api.services.disclaimers.getDisclaimerByRegion,
//     selectedCountry
//       ? {
//           region: getRegionCode(selectedCountry.value),
//           category: "landlord_verification",
//         }
//       : "skip",
//   );

//   // Actions and Mutations
//   const detectIP = useAction(api.services.ipDetection.detectCountryFromIP);
//   const verifyTenantRequest = useMutation(
//     api.flows.landlordVerification.verifyTenantRequest,
//   );
//   const submitLandlordReview = useMutation(api.reviews.submitLandlordReview);
//   const logCompliance = useMutation(
//     api.services.disclaimers.logDisclaimerAcceptance,
//   );

//   // Helper function to map countries to regions
//   function getRegionCode(
//     country: string,
//   ): "US" | "UK" | "EU" | "INTERNATIONAL" {
//     const regions: Record<string, "US" | "UK" | "EU" | "INTERNATIONAL"> = {
//       "United States": "US",
//       "United Kingdom": "UK",
//       Germany: "EU",
//       France: "EU",
//       Spain: "EU",
//       Italy: "EU",
//       Netherlands: "EU",
//       Belgium: "EU",
//       Austria: "EU",
//       Portugal: "EU",
//       Poland: "EU",
//       Sweden: "EU",
//       Denmark: "EU",
//       Finland: "EU",
//       Ireland: "EU",
//     };
//     return regions[country] || "INTERNATIONAL";
//   }

//   // Initial validation and setup
//   useEffect(() => {
//     if (!inviteToken) {
//       toast.error("Invalid invitation link");
//       navigate("/login");
//       return;
//     }

//     if (tenancyDetails === undefined) return; // Still loading

//     if (!tenancyDetails) {
//       toast.error("Invalid or expired invitation link");
//       navigate("/login");
//       return;
//     }

//     if (
//       tenancyDetails.inviteTokenExpiry &&
//       Date.now() > tenancyDetails.inviteTokenExpiry
//     ) {
//       toast.error("Invitation has expired");
//       navigate("/login");
//       return;
//     }

//     // Check if user is already logged in
//     if (currentUser) {
//       setIsNewUser(false);
//       setStep("country");
//     } else {
//       setStep("account");
//     }
//   }, [tenancyDetails, currentUser, inviteToken, navigate]);

//   // Load countries
//   useEffect(() => {
//     const loadCountries = async () => {
//       try {
//         const response = await fetch(
//           "https://restcountries.com/v3.1/all?fields=name",
//         );
//         const data = await response.json();
//         const countryOptions = data
//           .map((country: any) => ({
//             value: country.name.common,
//             label: country.name.common,
//           }))
//           .sort((a: any, b: any) => a.label.localeCompare(b.label));

//         setCountries(countryOptions);
//       } catch (error) {
//         console.error("Failed to load countries:", error);
//         // Fallback countries
//         setCountries([
//           { value: "United States", label: "United States" },
//           { value: "United Kingdom", label: "United Kingdom" },
//           { value: "Germany", label: "Germany" },
//           { value: "France", label: "France" },
//           { value: "Spain", label: "Spain" },
//           { value: "Italy", label: "Italy" },
//           { value: "Netherlands", label: "Netherlands" },
//         ]);
//       }
//     };

//     if (step === "country") {
//       loadCountries();
//       detectLocation();
//     }
//   }, [step]);

//   // IP Detection
//   const detectLocation = async () => {
//     try {
//       // Get user's IP address
//       let userIP = "";
//       try {
//         const ipResponse = await fetch("https://api.ipify.org?format=json");
//         const ipData = await ipResponse.json();
//         userIP = ipData.ip || "127.0.0.1";
//       } catch (error) {
//         userIP = "127.0.0.1";
//       }

//       setIpAddress(userIP);

//       // Use our backend IP detection service
//       const detectionResult = await detectIP({ ipAddress: userIP });

//       if (detectionResult.success && detectionResult.country) {
//         setDetectedCountry(detectionResult.country);

//         // Auto-select detected country
//         const detectedOption = {
//           value: detectionResult.country,
//           label: detectionResult.country,
//         };
//         setSelectedCountry(detectedOption);
//       }
//     } catch (error) {
//       console.error("IP detection failed:", error);
//     }
//   };

//   // Load disclaimer when country is selected
//   useEffect(() => {
//     if (disclaimerData) {
//       setDisclaimerContent(disclaimerData.content);
//     }
//   }, [disclaimerData]);

//   // Handle account creation/login
//   const handleAccountSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (isNewUser) {
//       // Validation for new account
//       if (
//         !accountData.firstName ||
//         !accountData.lastName ||
//         !accountData.email ||
//         !accountData.password
//       ) {
//         toast.error("Please fill in all required fields");
//         return;
//       }

//       if (accountData.password !== accountData.confirmPassword) {
//         toast.error("Passwords do not match");
//         return;
//       }

//       if (accountData.password.length < 8) {
//         toast.error("Password must be at least 8 characters");
//         return;
//       }
//     } else {
//       if (!accountData.email || !accountData.password) {
//         toast.error("Please enter your email and password");
//         return;
//       }
//     }

//     setLoading(true);
//     try {
//       if (isNewUser) {
//         await signUp("password", {
//           email: accountData.email,
//           password: accountData.password,
//           firstName: accountData.firstName,
//           lastName: accountData.lastName,
//           role: "landlord",
//         });
//         toast.success("Account created successfully!");
//       } else {
//         await signIn("password", {
//           email: accountData.email,
//           password: accountData.password,
//         });
//         toast.success("Logged in successfully!");
//       }

//       // Wait for auth to settle, then proceed
//       setTimeout(() => {
//         setStep("country");
//       }, 1000);
//     } catch (error: any) {
//       console.error("Authentication error:", error);
//       toast.error(error.message || "Authentication failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle country confirmation
//   const handleCountryConfirm = () => {
//     if (!selectedCountry) {
//       toast.error("Please select your country of residence");
//       return;
//     }
//     setStep("disclaimer");
//   };

//   // Handle disclaimer scroll
//   const handleScroll = () => {
//     if (disclaimerRef.current) {
//       const { scrollTop, scrollHeight, clientHeight } = disclaimerRef.current;
//       const scrolledPercentage =
//         (scrollTop / (scrollHeight - clientHeight)) * 100;

//       if (scrolledPercentage >= 95) {
//         setHasScrolledDisclaimer(true);
//       }
//     }
//   };

//   // Handle disclaimer acceptance
//   const handleDisclaimerAccept = async () => {
//     if (!hasScrolledDisclaimer) {
//       toast.error(
//         "Please scroll through the entire disclaimer before accepting",
//       );
//       return;
//     }

//     setLoading(true);
//     try {
//       // Log disclaimer acceptance
//       await logCompliance({
//         userId: currentUser?._id || "temp",
//         disclaimerVersionId: disclaimerData?._id,
//         ipAddress,
//         userAgent: navigator.userAgent,
//         tenancyId: tenancyDetails?._id,
//         region: selectedCountry ? getRegionCode(selectedCountry.value) : "US", // Fallback region
//         category: "landlord_verification", // Specify category
//       });

//       setStep("review-choice");
//     } catch (error) {
//       console.error("Error logging compliance:", error);
//       toast.error("Failed to log compliance. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle review choice submission
//   const handleReviewChoiceSubmit = () => {
//     if (!reviewChoices.agreeToReview) {
//       toast.error("You must agree to provide a review to proceed");
//       return;
//     }

//     setStep("review-form");
//   };

//   // Handle review form submission
//   const handleReviewSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!currentUser) {
//       toast.error("You must be logged in to submit a review");
//       return;
//     }

//     if (!reviewForm.comments.trim()) {
//       toast.error("Please provide comments for your review");
//       return;
//     }

//     setLoading(true);
//     try {
//       // First verify the tenant request with landlord choices
//       const verificationResult = await verifyTenantRequest({
//         inviteToken: inviteToken!,
//         landlordUserId: currentUser._id,
//         agreeToReview: reviewChoices.agreeToReview,
//         agreeToBeReviewed: reviewChoices.agreeToBeReviewed,
//         landlordCountry: selectedCountry!.value,
//         ipAddress,
//         disclaimerLogId: undefined, // We already logged it
//       });

//       if (!verificationResult.success) {
//         throw new Error(verificationResult.error || "Failed to verify request");
//       }

//       // Submit the landlord review
//       const reviewResult = await submitLandlordReview({
//         tenancyId: verificationResult.tenancyId!,
//         ...reviewForm,
//       });

//       if (reviewResult.success) {
//         setStep("complete");
//         toast.success("Review submitted successfully!");
//       } else {
//         throw new Error(reviewResult.error || "Failed to submit review");
//       }
//     } catch (error: any) {
//       console.error("Error submitting review:", error);
//       toast.error(error.message || "Failed to submit review");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Determine if this is a tenant-initiated flow
//   const isTenantInitiated = tenancyDetails?.status === "tenant_initiated";
//   const isFreeReview = tenancyDetails?.freeReviewEligible;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-2xl mx-auto">
//           <div className="bg-white rounded-lg shadow-lg p-8">
//             {/* Header */}
//             <div className="text-center mb-8">
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                 Landlord Verification
//               </h1>
//               {isTenantInitiated ? (
//                 <p className="text-gray-600">
//                   Complete your verification and submit your first free review
//                 </p>
//               ) : (
//                 <p className="text-gray-600">
//                   Complete your verification to confirm this tenancy
//                 </p>
//               )}
//             </div>

//             {/* Progress Indicator */}
//             <div className="mb-8">
//               <div className="flex items-center justify-between text-sm text-gray-500">
//                 <span
//                   className={
//                     step === "account" ? "text-blue-600 font-medium" : ""
//                   }
//                 >
//                   Account
//                 </span>
//                 <span
//                   className={
//                     step === "country" ? "text-blue-600 font-medium" : ""
//                   }
//                 >
//                   Location
//                 </span>
//                 <span
//                   className={
//                     step === "disclaimer" ? "text-blue-600 font-medium" : ""
//                   }
//                 >
//                   Terms
//                 </span>
//                 <span
//                   className={
//                     step === "review-choice" ? "text-blue-600 font-medium" : ""
//                   }
//                 >
//                   Choices
//                 </span>
//                 <span
//                   className={
//                     step === "review-form" ? "text-blue-600 font-medium" : ""
//                   }
//                 >
//                   Review
//                 </span>
//                 <span
//                   className={
//                     step === "complete" ? "text-blue-600 font-medium" : ""
//                   }
//                 >
//                   Complete
//                 </span>
//               </div>
//               <div className="mt-2 h-1 bg-gray-200 rounded-full">
//                 <div
//                   className="h-1 bg-blue-600 rounded-full transition-all duration-300"
//                   style={{
//                     width:
//                       step === "loading"
//                         ? "0%"
//                         : step === "account"
//                           ? "16%"
//                           : step === "country"
//                             ? "32%"
//                             : step === "disclaimer"
//                               ? "48%"
//                               : step === "review-choice"
//                                 ? "64%"
//                                 : step === "review-form"
//                                   ? "80%"
//                                   : step === "complete"
//                                     ? "100%"
//                                     : "0%",
//                   }}
//                 />
//               </div>
//             </div>

//             {/* Step Content */}
//             {step === "loading" && (
//               <div className="text-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                 <p className="text-gray-600">Loading invitation details...</p>
//               </div>
//             )}

//             {step === "account" && (
//               <div>
//                 <h2 className="text-xl font-semibold mb-4">
//                   {isNewUser ? "Create Landlord Account" : "Sign In"}
//                 </h2>

//                 <div className="mb-4 flex bg-gray-100 rounded-lg p-1">
//                   <button
//                     type="button"
//                     onClick={() => setIsNewUser(true)}
//                     className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
//                       isNewUser
//                         ? "bg-white text-gray-900 shadow-sm"
//                         : "text-gray-600"
//                     }`}
//                   >
//                     Create Account
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setIsNewUser(false)}
//                     className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
//                       !isNewUser
//                         ? "bg-white text-gray-900 shadow-sm"
//                         : "text-gray-600"
//                     }`}
//                   >
//                     Sign In
//                   </button>
//                 </div>

//                 <form onSubmit={handleAccountSubmit}>
//                   {isNewUser && (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                       <InputField
//                         label="First Name"
//                         name="firstName"
//                         value={accountData.firstName}
//                         onChange={(e) =>
//                           setAccountData((prev) => ({
//                             ...prev,
//                             firstName: e.target.value,
//                           }))
//                         }
//                         required
//                       />
//                       <InputField
//                         label="Last Name"
//                         name="lastName"
//                         value={accountData.lastName}
//                         onChange={(e) =>
//                           setAccountData((prev) => ({
//                             ...prev,
//                             lastName: e.target.value,
//                           }))
//                         }
//                         required
//                       />
//                     </div>
//                   )}

//                   <InputField
//                     label="Email Address"
//                     name="email"
//                     type="email"
//                     value={accountData.email}
//                     onChange={(e) =>
//                       setAccountData((prev) => ({
//                         ...prev,
//                         email: e.target.value,
//                       }))
//                     }
//                     required
//                   />

//                   {isNewUser && (
//                     <InputField
//                       label="Mobile Phone (Optional)"
//                       name="mobile"
//                       type="tel"
//                       value={accountData.mobile}
//                       onChange={(e) =>
//                         setAccountData((prev) => ({
//                           ...prev,
//                           mobile: e.target.value,
//                         }))
//                       }
//                     />
//                   )}

//                   <InputField
//                     label="Password"
//                     name="password"
//                     type="password"
//                     value={accountData.password}
//                     onChange={(e) =>
//                       setAccountData((prev) => ({
//                         ...prev,
//                         password: e.target.value,
//                       }))
//                     }
//                     required
//                   />

//                   {isNewUser && (
//                     <div className="mb-6">
//                       <InputField
//                         label="Confirm Password"
//                         name="confirmPassword"
//                         type="password"
//                         value={accountData.confirmPassword}
//                         onChange={(e) =>
//                           setAccountData((prev) => ({
//                             ...prev,
//                             confirmPassword: e.target.value,
//                           }))
//                         }
//                         required
//                       />
//                     </div>
//                   )}

//                   <Button type="submit" disabled={loading} className="w-full">
//                     {loading
//                       ? "Processing..."
//                       : isNewUser
//                         ? "Create Account"
//                         : "Sign In"}
//                   </Button>
//                 </form>
//               </div>
//             )}

//             {step === "country" && (
//               <div>
//                 <h2 className="text-xl font-semibold mb-4">
//                   Confirm Your Country
//                 </h2>

//                 {detectedCountry && (
//                   <div className="mb-4 p-4 bg-blue-50 rounded-lg">
//                     <p className="text-sm text-blue-800">
//                       <strong>Detected Location:</strong> {detectedCountry}
//                     </p>
//                     <p className="text-xs text-blue-600 mt-1">
//                       Please confirm or select your correct country of residence
//                       for legal compliance
//                     </p>
//                   </div>
//                 )}

//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Country of Residence *
//                   </label>
//                   <Select
//                     value={selectedCountry}
//                     onChange={setSelectedCountry}
//                     options={countries}
//                     placeholder="Select your country..."
//                     isSearchable
//                     className="mb-4"
//                   />
//                 </div>

//                 <Button
//                   onClick={handleCountryConfirm}
//                   disabled={!selectedCountry}
//                   className="w-full"
//                 >
//                   Continue
//                 </Button>
//               </div>
//             )}

//             {step === "disclaimer" && (
//               <div>
//                 <h2 className="text-xl font-semibold mb-4">Legal Disclaimer</h2>

//                 <div className="mb-4">
//                   <p className="text-sm text-gray-600 mb-4">
//                     Please read and scroll through the entire disclaimer before
//                     accepting:
//                   </p>

//                   <div
//                     ref={disclaimerRef}
//                     onScroll={handleScroll}
//                     className="h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50 text-sm"
//                   >
//                     {disclaimerContent || (
//                       <div>
//                         <h3 className="font-semibold mb-2">
//                           RentalCV Terms - Landlord Verification
//                         </h3>
//                         <p className="mb-4">
//                           By proceeding with this verification, you agree to:
//                         </p>
//                         <ol className="list-decimal list-inside space-y-2">
//                           <li>
//                             Verify the accuracy of the tenancy information
//                             provided
//                           </li>
//                           <li>
//                             Provide honest and factual reviews based on actual
//                             tenancy experience
//                           </li>
//                           <li>
//                             Respect tenant privacy and provide constructive
//                             feedback
//                           </li>
//                           <li>
//                             Understand that reviews will be publicly visible
//                           </li>
//                           <li>
//                             Comply with fair housing and anti-discrimination
//                             laws
//                           </li>
//                           <li>
//                             Take responsibility for the accuracy of information
//                             provided
//                           </li>
//                         </ol>
//                         {isTenantInitiated && (
//                           <div className="mt-4 p-3 bg-green-50 rounded-lg">
//                             <h4 className="font-semibold text-green-800 mb-2">
//                               Special Offer
//                             </h4>
//                             <p className="text-sm text-green-700">
//                               This review is <strong>free</strong> as part of
//                               your tenant's invitation to RentalCV. Help them
//                               build their rental history at no cost to you!
//                             </p>
//                           </div>
//                         )}
//                         <p className="mt-4">
//                           This agreement is governed by the laws of{" "}
//                           {getRegionCode(selectedCountry?.value || "")}
//                           and your data will be processed according to
//                           applicable privacy regulations.
//                         </p>
//                       </div>
//                     )}
//                   </div>

//                   {!hasScrolledDisclaimer && (
//                     <p className="text-xs text-amber-600 mt-2">
//                       ⚠️ Please scroll to the bottom to continue
//                     </p>
//                   )}
//                 </div>

//                 <Button
//                   onClick={handleDisclaimerAccept}
//                   disabled={!hasScrolledDisclaimer || loading}
//                   className="w-full"
//                 >
//                   {loading ? "Processing..." : "Accept & Continue"}
//                 </Button>
//               </div>
//             )}

//             {step === "review-choice" && tenancyDetails && (
//               <div>
//                 <h2 className="text-xl font-semibold mb-4">Review Options</h2>

//                 {/* Tenancy Summary */}
//                 <div className="bg-gray-50 rounded-lg p-6 mb-6">
//                   <h3 className="font-semibold text-gray-900 mb-3">
//                     Tenancy Summary
//                   </h3>
//                   <div className="space-y-2 text-sm">
//                     <p>
//                       <strong>Property:</strong>{" "}
//                       {tenancyDetails.property?.addressLine1}
//                     </p>
//                     <p>
//                       <strong>Tenant:</strong>{" "}
//                       {tenancyDetails.tenant?.firstName}{" "}
//                       {tenancyDetails.tenant?.lastName}
//                     </p>
//                     <p>
//                       <strong>Start Date:</strong>{" "}
//                       {new Date(tenancyDetails.startDate).toLocaleDateString()}
//                     </p>
//                     {tenancyDetails.endDate && (
//                       <p>
//                         <strong>End Date:</strong>{" "}
//                         {new Date(tenancyDetails.endDate).toLocaleDateString()}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Review Choice Options */}
//                 <div className="space-y-4 mb-6">
//                   {isTenantInitiated && isFreeReview && (
//                     <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
//                       <div className="flex items-center">
//                         <svg
//                           className="h-5 w-5 text-green-500 mr-2"
//                           fill="currentColor"
//                           viewBox="0 0 20 20"
//                         >
//                           <path
//                             fillRule="evenodd"
//                             d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                             clipRule="evenodd"
//                           />
//                         </svg>
//                         <span className="font-medium text-green-800">
//                           Free Review Opportunity
//                         </span>
//                       </div>
//                       <p className="text-sm text-green-700 mt-1">
//                         This review is completely free as part of your tenant's
//                         invitation to RentalCV.
//                       </p>
//                     </div>
//                   )}

//                   <div className="border rounded-lg p-4">
//                     <label className="flex items-start">
//                       <input
//                         type="checkbox"
//                         checked={reviewChoices.agreeToReview}
//                         onChange={(e) =>
//                           setReviewChoices((prev) => ({
//                             ...prev,
//                             agreeToReview: e.target.checked,
//                           }))
//                         }
//                         className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300"
//                       />
//                       <div className="ml-3">
//                         <span className="font-medium text-gray-900">
//                           ✓ I agree to provide a review for this tenant
//                         </span>
//                         <span className="ml-2 text-red-500 text-sm">
//                           (Required)
//                         </span>
//                         <p className="text-sm text-gray-600 mt-1">
//                           You will submit a review that will appear on the
//                           tenant's public RentalCV profile. This helps build
//                           their rental history and credibility with future
//                           landlords.
//                         </p>
//                       </div>
//                     </label>
//                   </div>

//                   <div className="border rounded-lg p-4">
//                     <label className="flex items-start">
//                       <input
//                         type="checkbox"
//                         checked={reviewChoices.agreeToBeReviewed}
//                         onChange={(e) =>
//                           setReviewChoices((prev) => ({
//                             ...prev,
//                             agreeToBeReviewed: e.target.checked,
//                           }))
//                         }
//                         className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300"
//                       />
//                       <div className="ml-3">
//                         <span className="font-medium text-gray-900">
//                           ☐ I also agree to be reviewed by this tenant
//                         </span>
//                         <span className="ml-2 text-gray-500 text-sm">
//                           {isTenantInitiated ? "(Optional)" : "(Recommended)"}
//                         </span>
//                         <p className="text-sm text-gray-600 mt-1">
//                           The tenant can review you as a landlord, helping you
//                           build credibility and attract quality tenants.
//                           {isTenantInitiated
//                             ? " This is optional for tenant-initiated invitations."
//                             : " This creates a mutual review relationship."}
//                         </p>
//                       </div>
//                     </label>
//                   </div>

//                   <div className="bg-blue-50 rounded-lg p-4">
//                     <h4 className="font-medium text-blue-900 mb-2">
//                       What this means:
//                     </h4>
//                     <ul className="text-sm text-blue-800 space-y-1">
//                       {reviewChoices.agreeToReview &&
//                         !reviewChoices.agreeToBeReviewed && (
//                           <>
//                             <li>• You will review the tenant only</li>
//                             <li>• The tenant cannot review you back</li>
//                             <li>
//                               • Your profile will show "Reviewing Landlord"
//                               status
//                             </li>
//                           </>
//                         )}
//                       {reviewChoices.agreeToReview &&
//                         reviewChoices.agreeToBeReviewed && (
//                           <>
//                             <li>
//                               • You will review each other (mutual reviews)
//                             </li>
//                             <li>
//                               • Both profiles will benefit from the review
//                               exchange
//                             </li>
//                             <li>
//                               • Your profile will show "Mutual Review Landlord"
//                               status
//                             </li>
//                           </>
//                         )}
//                       {!reviewChoices.agreeToReview && (
//                         <li className="text-amber-700">
//                           • You must agree to provide a review to proceed
//                         </li>
//                       )}
//                     </ul>
//                   </div>
//                 </div>

//                 <Button
//                   onClick={handleReviewChoiceSubmit}
//                   disabled={!reviewChoices.agreeToReview}
//                   className="w-full"
//                 >
//                   {reviewChoices.agreeToReview
//                     ? "Continue to Review Form"
//                     : "Please Select Required Option"}
//                 </Button>
//               </div>
//             )}

//             {step === "review-form" && (
//               <div>
//                 <h2 className="text-xl font-semibold mb-4">
//                   Submit Your Review
//                 </h2>

//                 {isFreeReview && (
//                   <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
//                     <p className="text-sm text-green-800">
//                       🎉 <strong>This review is free!</strong> Help your tenant
//                       build their RentalCV profile at no cost to you.
//                     </p>
//                   </div>
//                 )}

//                 <form onSubmit={handleReviewSubmit}>
//                   <div className="space-y-6">
//                     {/* Rating Categories */}
//                     {Object.entries({
//                       cleanliness: "Cleanliness & Property Care",
//                       communication: "Communication",
//                       paymentPunctuality: "Payment Punctuality",
//                       propertyRespect: "Property Respect",
//                     }).map(([key, label]) => (
//                       <div key={key}>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           {label}
//                         </label>
//                         <div className="flex items-center space-x-2">
//                           {[1, 2, 3, 4, 5].map((rating) => (
//                             <button
//                               key={rating}
//                               type="button"
//                               onClick={() =>
//                                 setReviewForm((prev) => ({
//                                   ...prev,
//                                   [key]: rating,
//                                 }))
//                               }
//                               className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
//                                 reviewForm[key as keyof ReviewFormData] >=
//                                 rating
//                                   ? "bg-yellow-400 text-white"
//                                   : "bg-gray-200 text-gray-600 hover:bg-gray-300"
//                               }`}
//                             >
//                               ★
//                             </button>
//                           ))}
//                           <span className="ml-2 text-sm text-gray-600">
//                             ({reviewForm[key as keyof ReviewFormData]}/5)
//                           </span>
//                         </div>
//                       </div>
//                     ))}

//                     {/* Overall Experience */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Overall Experience
//                       </label>
//                       <div className="flex items-center space-x-2">
//                         {[1, 2, 3, 4, 5].map((rating) => (
//                           <button
//                             key={rating}
//                             type="button"
//                             onClick={() =>
//                               setReviewForm((prev) => ({
//                                 ...prev,
//                                 overallExperience: rating,
//                               }))
//                             }
//                             className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
//                               reviewForm.overallExperience >= rating
//                                 ? "bg-blue-500 text-white"
//                                 : "bg-gray-200 text-gray-600 hover:bg-gray-300"
//                             }`}
//                           >
//                             ★
//                           </button>
//                         ))}
//                         <span className="ml-2 text-sm text-gray-600">
//                           ({reviewForm.overallExperience}/5)
//                         </span>
//                       </div>
//                     </div>

//                     {/* Would Recommend */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-3">
//                         Would you recommend this tenant to other landlords?
//                       </label>
//                       <div className="flex space-x-4">
//                         <label className="flex items-center">
//                           <input
//                             type="radio"
//                             name="wouldRecommend"
//                             checked={reviewForm.wouldRecommend === true}
//                             onChange={() =>
//                               setReviewForm((prev) => ({
//                                 ...prev,
//                                 wouldRecommend: true,
//                               }))
//                             }
//                             className="h-4 w-4 text-blue-600"
//                           />
//                           <span className="ml-2 text-sm text-gray-700">
//                             Yes
//                           </span>
//                         </label>
//                         <label className="flex items-center">
//                           <input
//                             type="radio"
//                             name="wouldRecommend"
//                             checked={reviewForm.wouldRecommend === false}
//                             onChange={() =>
//                               setReviewForm((prev) => ({
//                                 ...prev,
//                                 wouldRecommend: false,
//                               }))
//                             }
//                             className="h-4 w-4 text-blue-600"
//                           />
//                           <span className="ml-2 text-sm text-gray-700">No</span>
//                         </label>
//                       </div>
//                     </div>

//                     {/* Comments */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Additional Comments *
//                       </label>
//                       <textarea
//                         value={reviewForm.comments}
//                         onChange={(e) =>
//                           setReviewForm((prev) => ({
//                             ...prev,
//                             comments: e.target.value,
//                           }))
//                         }
//                         rows={4}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Share your experience with this tenant. Be honest and constructive..."
//                         required
//                       />
//                     </div>

//                     <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                       <p className="text-sm text-yellow-800">
//                         <strong>Please note:</strong> Your review will be
//                         publicly visible on the tenant's RentalCV profile.
//                         Ensure your feedback is honest, constructive, and
//                         complies with fair housing laws.
//                       </p>
//                     </div>
//                   </div>

//                   <Button
//                     type="submit"
//                     disabled={loading || !reviewForm.comments.trim()}
//                     className="w-full mt-6"
//                   >
//                     {loading ? "Submitting Review..." : "Submit Review"}
//                   </Button>
//                 </form>
//               </div>
//             )}

//             {step === "complete" && (
//               <div className="text-center">
//                 <div className="mb-6">
//                   <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
//                     <svg
//                       className="h-6 w-6 text-green-600"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M5 13l4 4L19 7"
//                       />
//                     </svg>
//                   </div>
//                 </div>

//                 <h2 className="text-2xl font-semibold text-gray-900 mb-4">
//                   Review Submitted Successfully!
//                 </h2>

//                 <div className="text-left bg-gray-50 rounded-lg p-6 mb-6">
//                   <h3 className="font-semibold mb-3">What happens next:</h3>
//                   <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
//                     <li>
//                       Your review has been published to the tenant's RentalCV
//                       profile
//                     </li>
//                     <li>The tenant has been notified about your review</li>
//                     {reviewChoices.agreeToBeReviewed && (
//                       <li>
//                         The tenant can now review you back (mutual review)
//                       </li>
//                     )}
//                     <li>
//                       The tenancy is now marked as active in both dashboards
//                     </li>
//                     {isFreeReview && (
//                       <li className="text-green-700 font-medium">
//                         This review was provided free of charge
//                       </li>
//                     )}
//                   </ul>
//                 </div>

//                 <div className="space-y-3">
//                   <Button
//                     onClick={() => navigate("/home")}
//                     className="w-full sm:w-auto"
//                   >
//                     Go to Dashboard
//                   </Button>

//                   {reviewChoices.agreeToBeReviewed && (
//                     <p className="text-sm text-gray-600">
//                       You'll receive a notification when the tenant submits
//                       their review of you.
//                     </p>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LandlordOnboarding;
