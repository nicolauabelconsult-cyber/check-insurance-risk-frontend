import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function RequirePerm({
  perm,
  children,
}: {
  perm: string;
  children: JSX.Element;
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.permissions?.includes(perm)) return <Navigate to="/risks" replace />;
  return children;
}
