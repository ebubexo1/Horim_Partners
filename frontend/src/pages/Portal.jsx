import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Portal() {
  const [mode, setMode] = useState("choose"); // choose | login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (["admin", "super_admin", "support"].includes(user.role)) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "login") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <h1 className="text-center text-2xl font-extrabold text-navy">Partner Login</h1>
        <form onSubmit={handleLogin} className="card mt-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="btn-navy w-full">{loading ? "Logging in…" : "Log In"}</button>
        </form>
        <button onClick={() => setMode("choose")} className="mt-4 block w-full text-center text-sm text-gray-500 hover:text-navy">
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
      <h1 className="text-2xl font-extrabold text-navy">Partner Portal</h1>
      <p className="mt-2 text-gray-600">Access your dashboard or start a new partnership.</p>

      <div className="mt-8 space-y-4">
        <button onClick={() => setMode("login")} className="card block w-full border-2 border-accentblue text-left hover:bg-accentblue/5">
          <p className="font-bold text-navy">I'm already a partner</p>
          <p className="text-sm text-gray-500">Log in to your existing account</p>
        </button>
        <Link to="/become-a-partner" className="card block w-full border-2 border-gold text-left hover:bg-gold/5">
          <p className="font-bold text-navy">Become a Partner</p>
          <p className="text-sm text-gray-500">Start the partnership registration process</p>
        </Link>
      </div>
    </div>
  );
}
