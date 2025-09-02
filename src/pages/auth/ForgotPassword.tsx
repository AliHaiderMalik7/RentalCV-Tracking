import React, {  useState } from "react";
import loginImage from "../../../public/banner.avif";
import Button from "@/components/common/Button";
import InputField from "@/components/common/InputField";
import { useNavigate } from "react-router-dom";

import { useAuthActions } from "@convex-dev/auth/react";
import {  FaArrowLeft,  FaEnvelope } from 'react-icons/fa';
import AuthBanner from "@/components/common/AuthBanner";

interface ForgotPasswordProps {
    onEmailSubmitted: (email: boolean) => void;
    // step: "forgot" | { email: string };
    setStep: React.Dispatch<React.SetStateAction<"forgot" | { email: string }>>;
}


function ForgotPassword({ onEmailSubmitted, setStep, }: ForgotPasswordProps) {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    //   const sendResetEmail = useMutation(api.auth.sendPasswordReset);

    const { signIn } = useAuthActions();
    console.log("isSubmitted", isSubmitted);
    


    const handleSubmit = async (event: any) => {
        event.preventDefault();
        try {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const result = await signIn("password", formData).then(() =>
                setStep({ email: formData.get("email") as string })
            );
            console.log("result", result);
            setIsSubmitted(true);
            onEmailSubmitted(true);

        } catch (err) {
            console.log("err", err);
            onEmailSubmitted(false);

            setIsSubmitted(false)
              setError(err instanceof Error ? err.message : "Failed to send reset email");
            //   toast.error(error);
        }
    };


    const handleResetPassword = async (event: any) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        console.log("formDtaaaaa", formData);
        const result = await signIn("password", {
            flow: "reset-verification",
        });

        console.log("result forgot", result);

    }



    return (
        <div className="min-h-screen flex bg-slate-50 font-sans antialiased">
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
                            Enter your email to receive a reset link
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="relative">
                            <InputField
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                required
                                leftIcon={<FaEnvelope className="text-lg" />}
                                leftIconClassName="text-slate-500"
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center">{error}</div>
                        )}
                        <input name="flow" type="hidden" value="reset" />

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#28c76f] to-[#28c76f] text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:from-[#20a955] hover:to-[#178746]"
                            >
                                Send Reset Link
                            </Button>
                        </div>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="flex items-center justify-center text-sm text-[#0369a1] hover:text-[#0284c7] transition-colors duration-300 mx-auto cursor-pointer"
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

export default ForgotPassword;