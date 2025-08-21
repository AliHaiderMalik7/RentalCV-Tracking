"use client";

import Signup from "./pages/auth/Signup";
// import RoleSelection from "./pages/role/RoleSelection";
// import Login from "./pages/auth/Login";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { AppRoutes } from "./routes/AppRouter";
import { BrowserRouter } from "react-router-dom";
import { Unauthenticated } from "convex/react";
import Login from "./pages/auth/Login";


export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>

  );
}
