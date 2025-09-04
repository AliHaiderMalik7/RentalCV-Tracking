import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import RoleSelection from "../pages/role/RoleSelection";
import { useState } from "react";
import { Authenticated, Unauthenticated, useConvexAuth } from "convex/react";
import Home from "@/pages/profile/Home";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import EmailVerification from "@/pages/auth/EmailVerification";
import TenantInviteVerification from "@/components/home/landlord/tenant/TenantInviteVerification";
import TenantInviteAcceptance from "@/pages/tenant/InviteAcceptance";
import TenantSignup from "@/pages/tenant/TenantSignup";
import LandlordVerification from "@/pages/auth/LandlordVerification";
import LandlordOnboarding from "@/pages/landlord/LandlordOnboarding";
import TenantPropertyDetailsForm from "@/components/home/tenant/TenantPropertyDetailsForm";
import TenantOnboarding from "@/pages/auth/TenantOnboarding";
import LandlordReviewForm from "@/components/reviews/LandlordReviewForm";

export function AppRoutes() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [resetEmail, setResetEmail] = useState<string>();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [step, setStep] = useState<"forgot" | { email: string }>("forgot");
  console.log("resetEmail", resetEmail);

  console.log("isAuthenticated", isAuthenticated);
  const handleRoleSelect = (role: "tenant" | "landlord") => {
    setSelectedRole(role);
    navigate("/signup");
  };

  const handleEmailSubmitted = (email: any) => {
    setResetEmail(email);
    navigate("/reset-password");
  };

  // 👇 Handle loading state
  if (isLoading) {
    return <div>Loading...</div>; // or a spinner component
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Unauthenticated>
            <Login />
          </Unauthenticated>
        }
      />

      <Route
        path="/forgot"
        element={
          <Unauthenticated>
            <ForgotPassword
              onEmailSubmitted={handleEmailSubmitted}
              setStep={setStep}
            />
          </Unauthenticated>
        }
      />

      <Route
        path="/reset-password"
        element={
          <Unauthenticated>
            {typeof step === "object" ? (
              <ResetPassword step={step} setStep={setStep} email={step.email} />
            ) : (
              <Navigate to="/forgot" replace />
            )}
          </Unauthenticated>
        }
      />

      <Route
        path="/select-role"
        element={
          <Unauthenticated>
            <RoleSelection onSelect={handleRoleSelect} />
          </Unauthenticated>
        }
      />

      <Route
        path="/signup"
        element={
          selectedRole ? (
            <Unauthenticated>
              <Signup selectedRole={selectedRole} />
            </Unauthenticated>
          ) : (
            <Navigate to="/select-role" replace />
          )
        }
      />

      <Route
        path="/verify-email"
        element={
          //   <Unauthenticated>
          <EmailVerification />
        }
      />

      <Route path="/verify-invite" element={<TenantInviteVerification />} />
      <Route path="/tenant/invite" element={<TenantInviteAcceptance />} />
      <Route path="/tenant/signup" element={<TenantSignup />} />

      <Route path="/landlord-verification" element={<LandlordVerification />} />
      <Route path="/landlord/onboarding" element={<LandlordOnboarding />} />

      <Route
        path="/tenant/add-property"
        element={
          <Authenticated>
            <TenantPropertyDetailsForm />
          </Authenticated>
        }
      />

      <Route
        path="/tenant/onboarding"
        element={
          <Authenticated>
            <TenantOnboarding />
          </Authenticated>
        }
      />

      <Route
        path="/landlord/review-tenant"
        element={
          <Authenticated>
            <LandlordReviewForm />
          </Authenticated>
        }
      />

      <Route
        path="/home"
        element={
          <Authenticated>
            <Home />
          </Authenticated>
        }
      />

      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
