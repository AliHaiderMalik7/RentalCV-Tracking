import React, { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import loginImage from "../../../public/banner.avif";
import Button from "@/components/common/Button";
import InputField from "@/components/common/InputField";
import { useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast, ToastContainer } from "react-toastify";
import AuthBanner from "@/components/common/AuthBanner";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  //@ts-ignore
  const [step, setStep] = useState<"signUp" | "signIn">("signIn");
  //@ts-ignore
  const [error, setError] = useState<String | null>(null);
  const [showPassword, setShowPassword] = useState(true);
  // const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuthActions();

  const checkEmailVerifiedByEmail = useMutation(
    api.auth.checkEmailVerifiedByEmail,
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    new FormData(event.currentTarget);

    try {
      const response = await checkEmailVerifiedByEmail({
        email: formData.email,
      });

      if (!response.success) {
        if (response.code === "EMAIL_NOT_VERIFIED") {
          toast.error("Please verify your email before logging in.");
          return;
        }
        if (response.code === "USER_NOT_FOUND") {
          toast.error("User not found.");
          return;
        }
      }
      const result = await signIn("password", {
        flow: "signIn",
        email: formData.email,
        password: formData.password,
        options: { credential: "include" },
      });

      if (result.signingIn) {
        navigate("/home"); // Redirect on success
      }
    } catch (err) {

      let errorMessage = "Login failed. Please try again.";
      if (err instanceof Error) {
        if (err.message.includes("InvalidSecret")) {
          errorMessage = "Invalid email or password";
        } else if (err.message.includes("network error")) {
          errorMessage = "Network error - please check your connection";
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      // setLoading(false);
    }
  };

  const handleRoleSelection = async () => {
    navigate("/select-role");
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans antialiased">
      <ToastContainer />
      {/* Left Side - Premium Image Section */}
      <div className="hidden lg:flex lg:w-1/2 h-screen sticky top-0 flex-col items-center justify-center bg-gray-200 p-8 relative">
        <AuthBanner imageSrc={loginImage} />
      </div>

      {/* Right Side - Elegant Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-[#0369a1] to-[#0284c7] p-8 text-center">
            <h2 className="text-3xl font-light text-white mb-1 tracking-wide">
              Welcome Back
            </h2>
            <p className="text-white font-light">
              Sign in to your premium account
            </p>
          </div>

          <form onSubmit={(e) => handleSubmit(e)} className="p-8 space-y-6">
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
                className="mb-4" // Optional container class
                inputClassName="custom-input-class" // Optional input class
              />
            </div>
            <input name="flow" type="hidden" value={step} />

            {/* Password */}
            <div className="relative">
              <InputField
                type={!showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
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
                className="mb-4"
                inputClassName="border-1 border-black rounded-lg"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-2">
              {/* <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 text-[#0369a1] focus:ring-[#0369a1] border-slate-300 rounded"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-slate-600"
                >
                  Remember me
                </label>
              </div> */}
              <div>
                <a
                  href="/forgot"
                  className="text-sm text-[#0369a1] hover:text-[#0284c7] transition-colors duration-300"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                iconPath="/assets/svg/goArrow.svg" // Just pass the path
                iconPosition="right"
                iconClassName="w-5 h-5 text-white" // Control icon styling
                className="w-full bg-gradient-to-r from-[#28c76f] to-[#28c76f] text-white font-medium py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:from-[#20a955] hover:to-[#178746] focus:outline-none focus:ring-2 focus:ring-[#28c76f] focus:ring-offset-2"
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* <div className="px-8 pb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button
                type="button"
                iconPath="/assets/svg/google.svg"
                iconPosition="left"
                className="cursor-pointer w-full inline-flex justify-center items-center py-3 px-4 border border-slate-200 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#28c76f] transition-all duration-300"
                iconClassName="w-5 h-5 mr-2"
              >
                Google
              </Button>

              <Button
                type="button"
                iconPath="/assets/svg/facebook.svg"
                iconPosition="left"
                className="w-full cursor-pointer inline-flex justify-center items-center py-3 px-4 border border-slate-200 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#28c76f] transition-all duration-300"
                iconClassName="w-6 h-6 mr-2"
              >
                Facebook
              </Button>
            </div>
          </div> */}

          <div className="px-8 pb-8 text-center text-sm text-slate-600 cursor-pointer">
            Don't have an account?{" "}
            <a
              className="font-medium text-[#0369a1] hover:text-[#0284c7] transition-colors duration-300"
              onClick={handleRoleSelection}
            >
              Sign up for an account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
