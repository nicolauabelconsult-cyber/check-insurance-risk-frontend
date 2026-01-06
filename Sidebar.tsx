import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { LayoutDashboard, Database, Users } from "lucide-react";

function linkClass({ isActive }:{ isActive:boolean }){
  return [
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
    isActive ? "bg-white/10 text-neutral-100" : "text-neutral-300 hover:bg-white/5 hover:text-neutral-100"
  ].join(" ");
}

export default function Sidebar(){
  const { isAdmin } = useAuth();
  return (
    <aside className="w-72 border-r border-white/10 p-4">
      <div className="mb-8">
        <div className="text-sm font-semibold tracking-wide">Check Insurance Risk</div>
        <div className="mt-1 text-xs text-neutral-500">Risk Console</div>
      </div>

      <nav className="space-y-1">
        <NavLink to="/" end className={linkClass}><LayoutDashboard size={16}/> Dashboard</NavLink>
        <NavLink to="/sources" className={linkClass}><Database size={16}/> Data Sources</NavLink>
        {isAdmin && (
          <>
            <div className="pt-4 pb-2 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Administration</div>
            <NavLink to="/users" className={linkClass}><Users size={16}/> Users</NavLink>
          </>
        )}
      </nav>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-neutral-400">
        <div className="font-semibold text-neutral-200">Sober UI</div>
        <div className="mt-1">Clarity, restraint, audit-friendly controls.</div>
      </div>
    </aside>
  );
}
