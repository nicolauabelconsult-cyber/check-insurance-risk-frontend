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
  if (!user || !user.permissions?.includes(perm)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
