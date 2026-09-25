import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function DonationSuccess() {
  const [params] = useSearchParams();
  const reference = params.get("ref") || params.get("reference") || params.get("trxref");
  const [status, setStatus] = useState("checking"); // checking | success | failed
  const [donation, setDonation] = useState(null);

  useEffect(() => {
    if (!reference) { setStatus("failed"); return; }
    api
      .get(`/donations/paystack/verify/${reference}`)
      .then((res) => {
        setDonation(res.data.donation);
        setStatus(res.data.donation.paymentStatus === "success" ? "success" : "failed");
      })
      .catch(() => setStatus("failed"));
  }, [reference]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6 lg:px-8">
      {status === "checking" && <p className="text-gray-600">Confirming your payment…</p>}

      {status === "success" && (
        <div className="card">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">✓</div>
          <h1 className="text-2xl font-extrabold text-navy">Thank you for your generosity!</h1>
          <p className="mt-2 text-gray-600">Your donation has been received and recorded.</p>
          {donation && (
            <div className="mt-6 space-y-1 rounded-lg bg-gray-50 p-4 text-left text-sm">
              <p><span className="text-gray-500">Amount:</span> <span className="font-semibold">{donation.currency} {donation.amount.toLocaleString()}</span></p>
              <p><span className="text-gray-500">Reference:</span> <span className="font-mono">{donation.transactionReference}</span></p>
              <p><span className="text-gray-500">Status:</span> <span className="font-semibold capitalize text-green-600">{donation.paymentStatus}</span></p>
            </div>
          )}
          <Link to="/" className="btn-navy mt-6 w-full">Back to Home</Link>
        </div>
      )}

      {status === "failed" && (
        <div className="card">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">✕</div>
          <h1 className="text-2xl font-extrabold text-navy">We couldn't confirm this payment</h1>
          <p className="mt-2 text-gray-600">If an amount was deducted, it will reconcile shortly, or please contact support.</p>
          <Link to="/donate" className="btn-navy mt-6 w-full">Try Again</Link>
        </div>
      )}
    </div>
  );
}
