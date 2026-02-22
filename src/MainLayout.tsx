import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const can = (perm: string) => !!user?.permissions?.includes(perm);
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  return (
    <>
      <div className="header">
        <div className="header-inner container">
          <div className="brand">
            <div className="logo" />
            <div>
              <h1>Check Insurance Risk</h1>
              <small>KYC • AML • PEP • Due Diligence</small>
            </div>
          </div>

          <nav className="nav" aria-label="main">
            {isAdmin && (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                  Dashboard
                </NavLink>
                <NavLink to="/dashboard-executivo" className={({ isActive }) => (isActive ? "active" : "")}>
                  Dashboard Executivo
                </NavLink>
              </>
            )}

            <NavLink to="/risks" className={({ isActive }) => (isActive ? "active" : "")}>
              Análises
            </NavLink>

            {user?.role === "SUPER_ADMIN" && (
              <NavLink to="/sources" className={({ isActive }) => (isActive ? "active" : "")}>
                Fontes
              </NavLink>
            )}

            {can("users:read") && (
              <NavLink to="/users" className={({ isActive }) => (isActive ? "active" : "")}>
                Utilizadores
              </NavLink>
            )}

            {can("audit:read") && (
              <NavLink to="/audit" className={({ isActive }) => (isActive ? "active" : "")}>
                Auditoria
              </NavLink>
            )}
          </nav>

          <div className="userbox">
            <span className="pill">
              {user?.name ?? "Sessão"} • {user?.role ?? "-"}
            </span>
            <button className="btn danger" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <main className="container" style={{ paddingTop: 18 }}>
        <div className="card" style={{ padding: 18 }}>
          <Outlet />
        </div>
      </main>
    </>
  );
}
