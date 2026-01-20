import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { Role } from "../api/auth";

export default function RequireRole({
  roles,
  children,
}: {
  roles: Role[];
  children: JSX.Element;
}) {
  const { token, user } = useAuth();
  const loc = useLocation();

  if (!token) return <Navigate to="/login" replace state={{ from: loc }} />;
  if (!user) return <div className="p-6 text-neutral-200">Loading...</div>;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
