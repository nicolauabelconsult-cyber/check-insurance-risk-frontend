import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
export function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthed } = useAuth();
  const location = useLocation();
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
