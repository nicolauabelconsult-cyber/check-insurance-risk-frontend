import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 16 }}>A validar sessão…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
    return <Navigate to="/app" replace />;
  }

  return children;
}
