import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Donate from "./pages/Donate";
import DonationSuccess from "./pages/DonationSuccess";
import BecomePartner from "./pages/BecomePartner";
import PartnerRegister from "./pages/PartnerRegister";
import PartnerPaymentSuccess from "./pages/PartnerPaymentSuccess";
import Portal from "./pages/Portal";
import PartnerDashboard from "./pages/PartnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/donate/success" element={<DonationSuccess />} />
          <Route path="/become-a-partner" element={<BecomePartner />} />
          <Route path="/partner/register" element={<PartnerRegister />} />
          <Route path="/partner/payment-success" element={<PartnerPaymentSuccess />} />
          <Route path="/portal" element={<Portal />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PartnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin", "super_admin", "support"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
