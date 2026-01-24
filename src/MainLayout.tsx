import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { can } from "../../lib/rbac/can";

export default function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <header>
        <strong>Check Insurance Risk</strong> — {user?.name}
        <button onClick={logout}>Logout</button>
      </header>

      <nav>
        <Link to="/risks">Análises</Link>{" "}
        {can(user, "sources:read") && <Link to="/sources">Fontes</Link>}{" "}
        {can(user, "users:read") && <Link to="/users">Utilizadores</Link>}{" "}
        {can(user, "audit:read") && <Link to="/audit">Auditoria</Link>}
      </nav>

      <hr />
      <Outlet />
    </div>
  );
}
