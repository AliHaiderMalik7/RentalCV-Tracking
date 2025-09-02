import { useConvexAuth } from "convex/react";
import { Navigate, Outlet } from "react-router-dom";
// import { Loader2 } from "lucide-react";

export function ProtectedRoute() {
  const { isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        {/* <Loader2 className="h-8 w-8 animate-spin" /> */}
      </div>
    );
  }

//   if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
//   }

  return <Outlet />;
}

export function AuthRoute() {
  const { isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        {/* <Loader2 className="h-8 w-8 animate-spin" /> */}
      </div>
    );
  }

//   if (isAuthenticated) {
    return <Navigate to="/select-role" replace />;
//   }

  return <Outlet />;
}