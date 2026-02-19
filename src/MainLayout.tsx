import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import React from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-md" />
          <div>
            <h1 className="text-lg font-semibold">Check Insurance Risk</h1>
            <p className="text-xs text-slate-400">
              KYC · AML · PEP · Due Diligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-300">
            {user?.name} · {user?.role}
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 border border-red-500 rounded-md text-red-400 hover:bg-red-500 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex gap-6 px-6 py-3 border-b border-slate-700 text-sm">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "text-blue-400" : "text-slate-300 hover:text-white"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/analyses"
          className={({ isActive }) =>
            isActive ? "text-blue-400" : "text-slate-300 hover:text-white"
          }
        >
          Análises
        </NavLink>

        {/* 🔒 Fontes apenas SUPER_ADMIN */}
        {user?.role === "SUPER_ADMIN" && (
          <NavLink
            to="/sources"
            className={({ isActive }) =>
              isActive ? "text-blue-400" : "text-slate-300 hover:text-white"
            }
          >
            Fontes
          </NavLink>
        )}

        <NavLink
          to="/users"
          className={({ isActive }) =>
            isActive ? "text-blue-400" : "text-slate-300 hover:text-white"
          }
        >
          Utilizadores
        </NavLink>

        {/* 🔒 Auditoria apenas ADMIN e SUPER_ADMIN */}
        {(user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") && (
          <NavLink
            to="/audit"
            className={({ isActive }) =>
              isActive ? "text-blue-400" : "text-slate-300 hover:text-white"
            }
          >
            Auditoria
          </NavLink>
        )}
      </nav>

      {/* Page Content */}
      <main className="p-6">{children}</main>
    </div>
  );
}
