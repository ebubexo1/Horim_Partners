import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// roles: optional array e.g. ["admin","super_admin","support"]
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-navy">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/portal" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
