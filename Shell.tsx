import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export function Shell() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Topbar />
          <main className="p-6 max-w-[1400px] mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
