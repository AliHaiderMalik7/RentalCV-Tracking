import React, { useEffect, useState } from "react";
import { FaLock } from "react-icons/fa";
import loginImage from "../../../public/banner.avif";
import Button from "@/components/common/Button";
import { useAuthActions } from "@convex-dev/auth/react";
import { FaShieldAlt, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import AuthBanner from "@/components/common/AuthBanner";
interface ResetPasswordProps {
    step: "forgot" | { email: string };
    setStep: React.Dispatch<React.SetStateAction<"forgot" | { email: string }>>;
    email: string;

}

function ResetPassword({ step, email }: ResetPasswordProps) {
    const { signIn } = useAuthActions();  
    //@ts-ignore
    const [error, setError] = useState("");


    const [showNewPassword, setShowNewPassword] = useState(false);
    const navigate = useNavigate()

    useEffect(() => {
        console.log("step in reset", step);

    }, [step])

    const handleResetPassword = async (event: any) => {
        event.preventDefault();
        const form = event.currentTarget; // ✅ this is your HTMLFormElement
        const data = new FormData(form); // ✅ corre    setError("");
        console.log("formmmmmm", data);


        try {
            const result = await signIn("password", data);
            if (result.signingIn) {
                navigate("/home"),

                    // Handle specific Convex Auth errors
                    toast.success("Password reset successful! Please login with your new password");

            }

            // Success case - redirect to login

        } catch (error) {
            // Our error handler from above
            console.error("Password reset error:", error);
            let errorMessage = "Password reset failed. Please try again.";

            if (error instanceof Error) {
                if (error.message.includes("Could not verify code")) {
                    errorMessage = "The verification code is incorrect or expired";
                } else {
                    const match = error.message.match(/Uncaught Error: ([^\n]*)/);
                    errorMessage = match ? match[1] : error.message;
                }
            }

            toast.error(errorMessage);
        }
    };
    return (
        <div className="min-h-screen flex bg-slate-50 font-sans antialiased">
            <ToastContainer />
            <div className="hidden lg:flex lg:w-1/2 h-screen sticky top-0 flex-col items-center justify-center bg-gray-200 p-8 relative">
                {/* Image Container - Centered with proper aspect ratio */}
                <AuthBanner
                    imageSrc={loginImage}

                />
            </div>
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="bg-gradient-to-r from-[#0369a1] to-[#0284c7] p-8 text-center">
                        <h2 className="text-3xl font-light text-white mb-1 tracking-wide">
                            Reset Password
                        </h2>
                        <p className="text-white font-light">
                            Enter verification code and new password
                        </p>
                    </div>

                    <form onSubmit={(event) => {
                        handleResetPassword(event)
                    }} className="p-8 space-y-6">
                        {/* OTP */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                <FaShieldAlt className="text-lg" />
                            </div>
                            <input
                                type="text"
                                name="code"
                                placeholder="Verification Code"
                                className="w-full pl-12 pr-4 py-3 border-b border-slate-200 focus:border-[#28c76f] focus:outline-none bg-transparent transition-colors duration-300 placeholder-slate-400"
                                required
                            />
                        </div>

                        {/* Hidden Email & Flow */}
                        <input name="email" value={email} type="hidden" />
                        <input name="flow" value="reset-verification" type="hidden" />

                        {/* New Password */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                <FaLock className="text-lg" />
                            </div>
                            <input
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                placeholder="New Password"
                                className="w-full pl-12 pr-12 py-3 border-b border-slate-200 focus:border-[#28c76f] focus:outline-none bg-transparent transition-colors duration-300 placeholder-slate-400"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-700 transition-colors duration-300"
                            >
                                {showNewPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                            </button>
                        </div>

                        {/* Confirm Password */}
                        {/* <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                <FaLock className="text-lg" />
                            </div>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                className="w-full pl-12 pr-12 py-3 border-b border-slate-200 focus:border-[#28c76f] focus:outline-none bg-transparent transition-colors duration-300 placeholder-slate-400"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-700 transition-colors duration-300"
                            >
                                {showConfirmPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                            </button>
                        </div> */}

                        {/* Error Message */}
                        {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                        {/* Submit */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#28c76f] to-[#28c76f] text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:from-[#20a955] hover:to-[#178746]"
                            >
                                Reset Password
                            </Button>
                        </div>

                        {/* Back to Login */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="flex items-center justify-center text-sm text-[#0369a1] hover:text-[#0284c7]  transition-colors duration-300 mx-auto"
                            >
                                <FaArrowLeft className="mr-2" />
                                Back to Login
                            </button>
                        </div>
                    </form>


                </div>
            </div>
        </div>
    );
};

export default ResetPassword;