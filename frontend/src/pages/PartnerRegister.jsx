import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function PartnerRegister() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { register } = useAuth();

  const level = state?.level || "freewill";
  const levelName = state?.levelName || "Freewill Giving";
  const [amount, setAmount] = useState(state?.amount || "");

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    address: "", country: "", preferredContactMethod: "email", notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!state?.level) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-gray-600">Please choose a partnership level first.</p>
        <Link to="/become-a-partner" className="btn-navy mt-4 inline-flex">Choose a Level</Link>
      </div>
    );
  }

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("Name, email and password are required.");
      return;
    }
    setLoading(true);
    try {
      await register({ ...form });
      const { data } = await api.post("/partners/choose-level", { level, amount });
      window.location.href = data.authorization_url; // Straight to Paystack
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-center text-3xl font-extrabold text-navy">Register as a Partner</h1>
      <p className="mt-2 text-center text-gray-600">
        You're joining as a <span className="font-semibold text-gold">{levelName}</span> partner
        {level !== "freewill" ? "" : ` at ₦${Number(amount || 0).toLocaleString()}/month`}.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-4">
        {level === "platinum" && (
          <div>
            <label className="label">Monthly Contribution (₦1,000,000 or more)</label>
            <input type="number" min="1000000" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={form.name} onChange={update("name")} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={update("email")} required />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Phone Number</label>
            <input className="input" value={form.phone} onChange={update("phone")} />
          </div>
          <div>
            <label className="label">Country</label>
            <input className="input" value={form.country} onChange={update("country")} />
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <input className="input" value={form.address} onChange={update("address")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Preferred Contact Method</label>
            <select className="input" value={form.preferredContactMethod} onChange={update("preferredContactMethod")}>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
          <div>
            <label className="label">Create Password</label>
            <input type="password" className="input" value={form.password} onChange={update("password")} required minLength={6} />
          </div>
        </div>
        <div>
          <label className="label">Notes (optional)</label>
          <textarea className="input" rows={2} value={form.notes} onChange={update("notes")} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-gold w-full text-base disabled:opacity-60">
          {loading ? "Setting up your partnership…" : "Continue to Payment"}
        </button>
      </form>
    </div>
  );
}
