import React, { useEffect, useState } from "react";
import api from "../api/axios";
import BankAccountCard from "../components/BankAccountCard";

const PRESET_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

export default function Donate() {
  const [tab, setTab] = useState("online"); // online | bank
  const [amount, setAmount] = useState(10000);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    api.get("/bank-accounts").then((res) => setAccounts(res.data.accounts)).catch(() => {});
  }, []);

  const finalAmount = customAmount ? Number(customAmount) : amount;

  const handleDonate = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !finalAmount || finalAmount <= 0) {
      setError("Please enter your name, email and a valid amount.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/donations/paystack/init", {
        name, email, phone, amount: finalAmount, currency: "NGN",
      });
      window.location.href = data.authorization_url; // Redirect to Paystack Checkout
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-center text-3xl font-extrabold text-navy">Make a Donation</h1>
      <p className="mt-2 text-center text-gray-600">Choose how you'd like to give — it only takes a moment.</p>

      <div className="mx-auto mt-8 flex max-w-md rounded-lg border border-gray-200 bg-white p-1">
        <button
          onClick={() => setTab("online")}
          className={`flex-1 rounded-md py-2.5 text-sm font-semibold ${tab === "online" ? "bg-navy text-white" : "text-navy"}`}
        >
          Donate Online
        </button>
        <button
          onClick={() => setTab("bank")}
          className={`flex-1 rounded-md py-2.5 text-sm font-semibold ${tab === "bank" ? "bg-navy text-white" : "text-navy"}`}
        >
          Bank Transfer
        </button>
      </div>

      {tab === "online" ? (
        <form onSubmit={handleDonate} className="card mt-6">
          <label className="label">Select an amount (₦)</label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => { setAmount(amt); setCustomAmount(""); }}
                className={`rounded-lg border-2 py-2 text-sm font-semibold ${
                  !customAmount && amount === amt ? "border-gold bg-gold/10 text-navy" : "border-gray-200 text-gray-600 hover:border-gold"
                }`}
              >
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <label className="label">Or enter a custom amount (₦)</label>
            <input
              type="number"
              min="100"
              className="input"
              placeholder="e.g. 15000"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
            />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Phone (optional)</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-gold mt-6 w-full text-base disabled:opacity-60">
            {loading ? "Redirecting to Paystack…" : `Donate Now — ₦${finalAmount ? finalAmount.toLocaleString() : 0}`}
          </button>
          <p className="mt-3 text-center text-xs text-gray-400">
            You'll be securely redirected to Paystack Checkout to complete your payment.
          </p>
        </form>
      ) : (
        <div className="mt-6">
          <p className="mb-4 rounded-lg bg-accentblue/10 p-3 text-sm text-navy">
            Please use the correct account for the currency you're sending, and reference your name where possible.
          </p>
          <div className="space-y-4">
            {accounts.length === 0 && <p className="text-sm text-gray-500">Loading account details…</p>}
            {accounts.map((acc) => (
              <BankAccountCard key={acc.currency} account={acc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
