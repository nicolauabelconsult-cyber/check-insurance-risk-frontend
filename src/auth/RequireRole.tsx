import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { Role } from "../lib/types";

export default function RequireRole({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const { me, loading } = useAuth();
  if (loading) return <div className="container"><div className="notice">A carregar…</div></div>;
  if (!me) return <Navigate to="/login" replace />;
  if (!allow.includes(me.role)) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Acesso negado</div>
          <div className="muted">A tua conta não tem permissão para esta área.</div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
