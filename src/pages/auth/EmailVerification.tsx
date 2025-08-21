import  { useEffect, useState, useRef } from "react";
import { FaArrowLeft } from "react-icons/fa";
import loginImage from "../../../public/banner.avif";
import Button from "@/components/common/Button";
import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import AuthBanner from "@/components/common/AuthBanner";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface EmailVerificationProps {
    email: string;
}

function EmailVerification() {
    const { signOut } = useAuthActions();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState<any>("")
    const verifyEmail = useMutation(api.emailVerification.verifyEmail);
    const generateToken = useMutation(api.emailVerification.generateEmailVerificationToken);
    const sendEmail = useAction(api.emailVerification.sendVerificationEmail);


    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [error, setError] = useState<any>("");

    const hasRun = useRef(false); // 👈 prevent duplicate execution

    // Extract token from URL
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    useEffect(() => {
        if (hasRun.current) return; // skip if already ran once
        hasRun.current = true;

        signOut(); // logout while verifying

        if (!token) {
            setStatus("error");
            setError("Invalid or missing verification token.");
            return;
        }

        const verify = async () => {
            try {
                const result = await verifyEmail({ token });
                console.log("result", result);

                if (result.alreadyVerified) {
                    setStatus("success");
                    toast.info("Your email is already verified!", { toastId: "already-verified" });
                }
                if (result.success && !result.alreadyVerified) {
                    setStatus("success");
                    toast.success("✅ Email verified successfully!", { toastId: "verify-success" });
                }
                if (!result.success) {
                    setStatus("error");
                    setEmail(result.email)
                    setError(result.error);
                    toast.error(result.error, { toastId: "verify-error" });
                }
            } catch (err) {
                console.error("Email verification error:", err);
                setStatus("error");
                let errorMessage = "Verification failed. Please try again.";
                if (err instanceof Error) {
                    if (err.message.includes("expired")) {
                        errorMessage = "⏰ Your verification link has expired.";
                    } else if (err.message.includes("Invalid")) {
                        errorMessage = "⚠️ Invalid verification link.";
                    }
                }
                setError(errorMessage);
                toast.error(errorMessage, { toastId: "verify-error" });
            }
        };

        verify();
    }, [token, verifyEmail, signOut]);

    const handleResend = async () => {
        try {
            const token = await generateToken({email});
            await sendEmail({ email, token });
            toast.success("📧 Verification link resent! Please check your inbox.", {
                toastId: "resend-success",
            });
        } catch (err) {
            console.error("Resend failed:", err);
            toast.error("Failed to resend verification link. Try again later.", {
                toastId: "resend-error",
            });
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans antialiased">
            <ToastContainer />
            <div className="hidden lg:flex lg:w-1/2 h-screen sticky top-0 flex-col items-center justify-center bg-gray-200 p-8 relative">
                <AuthBanner imageSrc={loginImage} />
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="bg-gradient-to-r from-[#0369a1] to-[#0284c7] p-8 text-center">
                        <h2 className="text-3xl font-light text-white mb-1 tracking-wide">
                            Email Verification
                        </h2>
                    </div>

                    <div className="p-8 space-y-6 text-center">
                        {status === "loading" && (
                            <p className="text-slate-600">⏳ Verifying your email...</p>
                        )}

                        {status === "success" && (
                            <>
                                <p className="text-green-600 font-medium">
                                    ✅ Your email <span className="font-bold">{email}</span> has been verified!
                                </p>
                                <Button
                                    onClick={() => navigate("/login")}
                                    className="w-full bg-gradient-to-r from-[#28c76f] to-[#28c76f] text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:from-[#20a955] hover:to-[#178746]"
                                >
                                    Go to Login
                                </Button>
                            </>
                        )}

                        {status === "error" && (
                            <>
                                <p className="text-red-500">{error}</p>
                                <Button
                                    onClick={handleResend}
                                    className="w-full bg-gradient-to-r from-[#f43f5e] to-[#e11d48] text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:from-[#be123c] hover:to-[#9f1239]"
                                >
                                    Resend Verification Link
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="flex items-center justify-center text-sm text-[#0369a1] hover:text-[#0284c7] transition-colors duration-300 mx-auto mt-4"
                                >
                                    <FaArrowLeft className="mr-2" />
                                    Back to Login
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmailVerification;
