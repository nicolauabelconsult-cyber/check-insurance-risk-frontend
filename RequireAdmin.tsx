import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
export function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
