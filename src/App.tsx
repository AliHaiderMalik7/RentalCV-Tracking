"use client";
import "react-toastify/dist/ReactToastify.css";
import { AppRoutes } from "./routes/AppRouter";
import { BrowserRouter } from "react-router-dom";


export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>

  );
}
