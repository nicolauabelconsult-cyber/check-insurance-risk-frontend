import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Badge from "./ui/Badge";

const linkBase = "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition";
const active = "bg-neutral-900 text-white";
const idle = "text-neutral-300 hover:bg-neutral-900";

export default function Sidebar() {
  const { isAdmin, user } = useAuth();
  return (
    <div className="w-64 shrink-0 border-r border-neutral-900 bg-neutral-950 p-4">
      <div className="mb-6">
        <div className="text-sm font-semibold tracking-wide">Check Insurance Risk</div>
        <div className="mt-1 text-xs text-neutral-500">Enterprise Console</div>
      </div>

      <nav className="space-y-1">
        <NavLink to="/" className={({isActive}) => `${linkBase} ${isActive?active:idle}`}>Dashboard</NavLink>
        <NavLink to="/sources" className={({isActive}) => `${linkBase} ${isActive?active:idle}`}>Data Sources</NavLink>
        <NavLink to="/analyses" className={({isActive}) => `${linkBase} ${isActive?active:idle}`}>
          <span>Risk Analyses</span>
          <Badge tone="neutral">Beta</Badge>
        </NavLink>
        {isAdmin && (
          <NavLink to="/users" className={({isActive}) => `${linkBase} ${isActive?active:idle}`}>Users</NavLink>
        )}
        <NavLink to="/logout" className={({isActive}) => `${linkBase} ${isActive?active:idle}`}>Logout</NavLink>
      </nav>

      <div className="mt-8 rounded-xl border border-neutral-900 bg-neutral-950 p-3">
        <div className="text-xs text-neutral-500">Signed in as</div>
        <div className="mt-1 text-sm font-medium">{user?.username || "-"}</div>
        <div className="mt-1 text-xs text-neutral-500">{user?.role || "-"}</div>
      </div>
    </div>
  );
}
