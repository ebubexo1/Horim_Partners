import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function PartnerPaymentSuccess() {
  const [params] = useSearchParams();
  const reference = params.get("ref") || params.get("reference") || params.get("trxref");
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    if (!reference) { setStatus("failed"); return; }
    api.get(`/donations/paystack/verify/${reference}`)
      .then((res) => setStatus(res.data.donation.paymentStatus === "success" ? "success" : "failed"))
      .catch(() => setStatus("failed"));
  }, [reference]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6 lg:px-8">
      {status === "checking" && <p className="text-gray-600">Confirming your partnership payment…</p>}
      {status === "success" && (
        <div className="card">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">✓</div>
          <h1 className="text-2xl font-extrabold text-navy">Welcome to the partnership!</h1>
          <p className="mt-2 text-gray-600">Your payment was successful. Your dashboard is ready.</p>
          <Link to="/dashboard" className="btn-gold mt-6 w-full">Go to My Dashboard</Link>
        </div>
      )}
      {status === "failed" && (
        <div className="card">
          <h1 className="text-2xl font-extrabold text-navy">Payment not confirmed</h1>
          <p className="mt-2 text-gray-600">Please try again or contact support if you were charged.</p>
          <Link to="/dashboard" className="btn-navy mt-6 w-full">Go to Dashboard</Link>
        </div>
      )}
    </div>
  );
}
