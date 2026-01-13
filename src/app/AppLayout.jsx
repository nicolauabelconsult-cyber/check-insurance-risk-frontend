import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const titles = {
  "/": { title: "Dashboard", subtitle: "Operational overview and key indicators." },
  "/sources": { title: "Data Sources", subtitle: "Upload and manage Excel data sources." },
  "/analyses": { title: "Risk Analyses", subtitle: "Create and review risk analyses (beta UI)." },
  "/users": { title: "Users", subtitle: "Manage access and permissions." },
};

export default function AppLayout() {
  const loc = useLocation();
  const meta = titles[loc.pathname] || { title: "Console", subtitle: "" };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar title={meta.title} subtitle={meta.subtitle} />
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
