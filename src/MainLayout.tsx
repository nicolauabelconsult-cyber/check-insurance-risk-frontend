import { Link, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function MainLayout() {
  const { user, logout } = useAuth();

  const can = (perm: string) => !!user?.permissions?.includes(perm);

  return (
    <div>
      <header style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <strong>Check Insurance Risk</strong>
        <span style={{ opacity: 0.8 }}>{user?.name}</span>
        <button onClick={logout}>Logout</button>
      </header>

      <nav style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <Link to="/risks">Análises</Link>
        {can("sources:read") && <Link to="/sources">Fontes</Link>}
        {can("users:read") && <Link to="/users">Utilizadores</Link>}
        {can("audit:read") && <Link to="/audit">Auditoria</Link>}
      </nav>

      <hr />
      <Outlet />
    </div>
  );
}
