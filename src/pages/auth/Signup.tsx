import React, { useEffect, useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaPhone,
  FaMapMarkerAlt,
  FaCity,
  FaGlobeAmericas,
  FaUpload,
} from "react-icons/fa";
import signupImage from "../../../public/banner.avif";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "react-router-dom";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import InputField from "@/components/common/InputField";
import Dropdown from "@/components/common/Dropdown";
import AuthBanner from "@/components/common/AuthBanner";
import { Id } from "../../../convex/_generated/dataModel";

type SignupProps = {
  selectedRole: "tenant" | "landlord" | any;
};

const Signup = ({ selectedRole }: SignupProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedRole) {
      navigate("/select-role");
      return;
    }

    // Show landlord-specific prompt as toast
    if (selectedRole === "landlord") {
      toast(
        "🌟 Get your 'Verified Landlord' badge and show tenants you're committed to the highest standards of service.",
        {
          position: "top-center",
          autoClose: 7000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: "premium-toast",
          // bodyClassName: "premium-toast-body",
          progressClassName: "premium-toast-progress",
        },
      );
    }
  }, [selectedRole, navigate]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    phone: "",
    email: "",
    password: "",
    address: "",
    state: "",
    city: "",
    postalCode: "",
    idVerificationDocs: [],
    proofOfAddress: [],
    landlordLicense: [],
  });

  const { signOut } = useAuthActions();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState<"signUp" | "signIn">("signUp");
  const checkUserExists = useMutation(api.auth.checkUserExists);
  console.log("selectedRole", setStep);

  // Mutations for automatic email verification
  const generateToken = useMutation(
    api.emailVerification.generateEmailVerificationToken,
  );
  const sendEmail = useAction(api.emailVerification.sendVerificationEmail);
  const updateUser = useMutation(api.auth.updateUser);
  const generateUrl = useMutation(api.properties.generateUrl);

  const { signIn } = useAuthActions();

  const processFiles = async (files: File[]): Promise<Id<"_storage">[]> => {
    const uploadPromises = files.map(async (file) => {
      // Get upload URL
      const postUrl = await generateUrl();

      // Upload file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
      }

      const json = await result.json();
      return json.storageId as Id<"_storage">;
    });

    return Promise.all(uploadPromises);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSuccess("");
    try {
      console.log("im here", formData);

      if (!formData.gender) {
        throw new Error("Please select a gender");
      }

      let email = formData?.email;
      const { exists, inUsersTable } = await checkUserExists({ email });
      const idDocs = await processFiles(formData.idVerificationDocs);
      const proofDocs = await processFiles(formData.proofOfAddress);
      const landlordDocs = await processFiles(formData.landlordLicense);

      console.log("exists", exists, inUsersTable);

      if (exists && inUsersTable) {
        toast.error("User already Registered!");
      } else {
        console.log("formData", data);

        signIn("password", {
          flow: "signUp",
          email: formData.email,
          password: formData.password,
          // options: { credential: "include" },
        }).then(async () => {
          signOut();
          // if(result.signingIn){
          try {
            let validate = false;
            if (selectedRole === "landlord") {
              const hasAllDocs =
                formData.idVerificationDocs.length > 0 &&
                formData.proofOfAddress.length > 0 &&
                formData.landlordLicense.length > 0;

              validate = hasAllDocs;
            }

            const email: any = formData.email;
            const token = await generateToken({ email });
            await sendEmail({ email, token });
            const updateUserResponse = await updateUser({
              email: formData.email,
              firstName: formData.firstName,
              lastName: formData.lastName,
              phone: formData.phone,
              gender: formData.gender as "male" | "female" | "other",
              address: formData.address,
              city: formData.city,
              state: formData.state,
              postalCode: formData.postalCode,
              roles: selectedRole,
              createdAt: Date.now(),
              verified: validate,
              idVerificationDocs: idDocs,
              proofOfAddress: proofDocs,
              landlordLicense: landlordDocs,
            });
            console.log("updateUserResponse", updateUserResponse);
            toast.success(
              "Account created! Please check your email to verify your account.",
            );

            setTimeout(() => {
              if (selectedRole === "tenant") {
                navigate("/login");
              } else {
                navigate("/login");
              }
            }, 3000);

            // setTimeout(() => {
            //   if (selectedRole === "tenant") {
            //     navigate("/tenant/onboarding");
            //   } else {
            //     navigate("/login");
            //   }
            // }, 3000);
          } catch (error) {
            console.error("Failed to send verification email:", error);
            toast.success(
              "Account created! Please verify your email to continue.",
            );
          }
          // }
        });
      }
    } catch (err: any) {
      console.log("err", err.message);

      setError(err.message || "Signup failed");
      toast.error(err.message || "Signup failed");
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleVerificationUpload = (
    field: keyof typeof formData,
    files: File[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ...files], // append if multiple files
    }));
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans antialiased">
      {/* Left Side - Premium Image Section */}
      <div className="hidden lg:flex lg:w-1/2 h-screen sticky top-0 flex-col items-center justify-center bg-gray-200 p-8 relative">
        {/* Image Container - Centered with proper aspect ratio */}
        <AuthBanner imageSrc={signupImage} />
      </div>

      {/* Right Side - Elegant Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-[#0369a1] to-[#0284c7] p-8 text-center">
            <h2 className="text-3xl font-light text-white mb-1 tracking-wide">
              Create Your Account
            </h2>
            <p className="text-white font-light">
              Join our exclusive network of premium tenants and landlords
            </p>
          </div>

          <form className="p-8 space-y-6" onSubmit={(e) => handleSubmit(e)}>
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-6">
              <InputField
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
                leftIcon={<FaUser className="text-lg" />}
                leftIconClassName="text-slate-500"
                inputClassName=""
              />

              <InputField
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
                inputClassName=""
              />
            </div>

            {/* Gender and Phone */}
            <div className="grid grid-cols-2 gap-6">
              <div className="relative">
                <Dropdown
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  placeholder="Select Gender"
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" },
                  ]}
                  className=""
                  selectClassName=""
                  iconClassName="text-slate-500"
                />
              </div>
              <div className="relative">
                <InputField
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  leftIcon={<FaPhone className="text-lg" />}
                  leftIconClassName="text-slate-500"
                  inputClassName=""
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <InputField
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                leftIcon={<FaEnvelope className="text-lg" />}
                leftIconClassName="text-slate-500"
                inputClassName=""
              />
            </div>

            {/* Password */}
            <div className="relative">
              <InputField
                type={!showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                // minLength={8}
                leftIcon={<FaLock className="text-lg" />}
                rightIcon={
                  showPassword ? (
                    <FaEyeSlash className="text-lg" />
                  ) : (
                    <FaEye className="text-lg" />
                  )
                }
                onRightIconClick={() => setShowPassword(!showPassword)}
                leftIconClassName="text-slate-500"
                rightIconClassName="text-slate-500 hover:text-slate-700"
                inputClassName=""
              />
            </div>

            {/* Address */}
            <div className="relative">
              <InputField
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street Address"
                leftIcon={<FaMapMarkerAlt className="text-lg" />}
                leftIconClassName="text-slate-500"
                inputClassName=""
              />
            </div>
            <input name="flow" type="hidden" value={step} />

            {/* City, State, Postal Code */}
            <div className="grid grid-cols-3 gap-6">
              <div className="relative">
                <InputField
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  leftIcon={<FaCity className="text-lg" />}
                  leftIconClassName="text-slate-500"
                  inputClassName=""
                />
              </div>
              <div className="relative">
                <InputField
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  leftIcon={<FaGlobeAmericas className="text-lg" />}
                  leftIconClassName="text-slate-500"
                  inputClassName=""
                />
              </div>
              <div className="relative">
                <InputField
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="ZIP Code"
                  inputClassName=""
                />
              </div>
            </div>

            {selectedRole === "landlord" && (
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold text-slate-800">
                  🌟 Verified Landlord (Optional)
                </h3>
                <p className="text-sm text-slate-600">
                  Build trust with tenants by uploading verification documents.
                  Once verified, you’ll receive the prestigious{" "}
                  <span className="font-semibold">Verified Landlord Badge</span>
                  .
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Upload ID */}
                  <label className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center hover:bg-slate-50 transition shadow-sm">
                      <FaUpload className="mx-auto text-gray-400 text-2xl" />
                      <p className="text-sm text-gray-600 mt-2">
                        Upload Photo ID <br />
                        <span className="text-xs text-gray-500">
                          (Passport / Driver’s License)
                        </span>
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        multiple
                        onChange={(e) =>
                          handleVerificationUpload(
                            "idVerificationDocs",
                            Array.from(e.target.files || []),
                          )
                        }
                      />
                    </div>
                  </label>

                  {/* Proof of Address */}
                  <label className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center hover:bg-slate-50 transition shadow-sm">
                      <FaUpload className="mx-auto text-gray-400 text-2xl" />
                      <p className="text-sm text-gray-600 mt-2">
                        Upload Proof of Address <br />
                        <span className="text-xs text-gray-500">
                          (Utility Bill, Bank Statement)
                        </span>
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        multiple
                        onChange={(e) =>
                          handleVerificationUpload(
                            "proofOfAddress",
                            Array.from(e.target.files || []),
                          )
                        }
                      />
                    </div>
                  </label>

                  {/* Landlord License */}
                  <label className="cursor-pointer sm:col-span-2">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center hover:bg-slate-50 transition shadow-sm">
                      <FaUpload className="mx-auto text-gray-400 text-2xl" />
                      <p className="text-sm text-gray-600 mt-2">
                        Upload Landlord License / Company Details <br />
                        <span className="text-xs text-gray-500">
                          (Optional)
                        </span>
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        multiple
                        onChange={(e) =>
                          handleVerificationUpload(
                            "landlordLicense",
                            Array.from(e.target.files || []),
                          )
                        }
                      />
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                id="terms"
                className="h-4 w-4 text-[#0369a1] focus:ring-[#0369a1] border-slate-300 rounded"
                required
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-slate-600"
              >
                I agree to the{" "}
                <a href="#" className="text-[#0369a1] hover:text-[#0284c7]">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#0369a1] hover:text-[#0284c7]">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="cursor-pointer w-full bg-gradient-to-r from-[#28c76f] to-[#28c76f] text-white font-medium py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:from-[#20a955] hover:to-[#178746] focus:outline-none focus:ring-2 focus:ring-[#28c76f] focus:ring-offset-2"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>Create Premium Account</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </button>
            </div>
            {error && <div className="text-red-600 text-center">{error}</div>}
            {success && (
              <div className="text-green-600 text-center">{success}</div>
            )}
          </form>
          <ToastContainer />

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

export default Signup;
