import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../lib/types";

function can(role: Role, allowed: Role[]) {
  return allowed.includes(role);
}

export default function Layout() {
  const { me, logout } = useAuth();
  const role = me?.role;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="side-title">Check Insurance Risk</div>
        <div className="side-sub">Console</div>

        <div className="hr" />

        <div className="badge">
          <span className="muted">User:</span> <span>{me?.username ?? "-"}</span>
        </div>
        <div style={{ marginTop: 8 }} className="badge">
          <span className="muted">Role:</span> <span>{me?.role ?? "-"}</span>
        </div>

        <div className="nav" style={{ marginTop: 16 }}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Dashboard
          </NavLink>

          {role && can(role, ["SUPER_ADMIN"]) && (
            <NavLink to="/entities" className={({ isActive }) => (isActive ? "active" : "")}>
              Entidades
            </NavLink>
          )}

          {role && can(role, ["SUPER_ADMIN", "PLATFORM_ADMIN"]) && (
            <NavLink to="/users" className={({ isActive }) => (isActive ? "active" : "")}>
              Utilizadores
            </NavLink>
          )}

          {role && can(role, ["SUPER_ADMIN", "PLATFORM_ADMIN"]) && (
            <NavLink to="/sources" className={({ isActive }) => (isActive ? "active" : "")}>
              Fontes de informação
            </NavLink>
          )}

          {role && can(role, ["CLIENT_ADMIN", "CLIENT_ANALYST"]) && (
            <NavLink to="/analyses" className={({ isActive }) => (isActive ? "active" : "")}>
              Análises
            </NavLink>
          )}
        </div>

        <div className="hr" />
        <button className="btn danger" onClick={logout}>
          Terminar sessão
        </button>

        <div style={{ marginTop: 12 }} className="muted">
          Netlify: define <b>VITE_API_URL</b>.
        </div>
      </aside>

      <main>
        <div className="topbar">
          <div style={{ fontWeight: 700 }}>Console</div>
          <div className="muted" style={{ fontSize: 12 }}>
            {me?.name ? me.name : "Sessão ativa"}
          </div>
        </div>
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
