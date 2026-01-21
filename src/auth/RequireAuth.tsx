import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="container"><div className="notice">A carregar…</div></div>;
  if (!token) return <Navigate to="/login" replace state={{ from: loc }} />;
  return <>{children}</>;
}
