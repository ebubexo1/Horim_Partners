import React, { useState } from "react";
import api from "../api/axios";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.put("/auth/change-password", { currentPassword, newPassword });
      setMsg("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card max-w-md space-y-3">
      <h3 className="font-bold text-navy">Change Password</h3>
      <div>
        <label className="label">Current Password</label>
        <input type="password" className="input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
      </div>
      <div>
        <label className="label">New Password</label>
        <input type="password" className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
      </div>
      <div>
        <label className="label">Confirm New Password</label>
        <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
      </div>
      {msg && <p className="text-sm text-green-600">{msg}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={loading} className="btn-navy w-full">{loading ? "Updating…" : "Update Password"}</button>
    </form>
  );
}
