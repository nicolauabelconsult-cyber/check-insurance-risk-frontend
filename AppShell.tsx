import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../api/auth";

type NavItem = { to: string; label: string; roles: Role[] };

const items: NavItem[] = [
  { to: "/", label: "Overview", roles: ["SUPER_ADMIN", "PLATFORM_ADMIN", "CLIENT_ADMIN", "CLIENT_ANALYST"] },
  { to: "/analyses", label: "Analyses", roles: ["SUPER_ADMIN", "PLATFORM_ADMIN", "CLIENT_ADMIN", "CLIENT_ANALYST"] },
  { to: "/sources", label: "Info Sources", roles: ["SUPER_ADMIN", "PLATFORM_ADMIN"] },
  { to: "/users", label: "Users", roles: ["SUPER_ADMIN", "PLATFORM_ADMIN"] },
  { to: "/entities", label: "Entities", roles: ["SUPER_ADMIN"] },
];

export default function AppShell() {
  const { user, setToken } = useAuth();
  const role = user?.role;

  const allowed = items.filter((i) => (role ? i.roles.includes(role) : false));

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex max-w-7xl gap-6 p-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-5">
            <Link to="/" className="block text-sm font-semibold tracking-wide">
              Check Insurance Risk
            </Link>
            <div className="mt-1 text-xs text-neutral-500">Enterprise Console</div>

            <div className="mt-5 space-y-1">
              {allowed.map((i) => (
                <NavLink
                  key={i.to}
                  to={i.to}
                  className={({ isActive }) =>
                    [
                      "block rounded-xl px-3 py-2 text-sm",
                      isActive ? "bg-neutral-900 text-neutral-50" : "text-neutral-300 hover:bg-neutral-900/60",
                    ].join(" ")
                  }
                >
                  {i.label}
                </NavLink>
              ))}
            </div>

            <div className="mt-6 border-t border-neutral-900 pt-4">
              <div className="text-xs text-neutral-500">Signed in as</div>
              <div className="mt-1 text-sm font-semibold">{user?.username}</div>
              <div className="mt-1 text-xs text-neutral-400">{user?.role}</div>

              <button
                className="mt-4 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
                onClick={() => setToken(null)}
              >
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-6 rounded-2xl border border-neutral-900 bg-neutral-950 p-5 lg:hidden">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Check Insurance Risk</div>
                <div className="text-xs text-neutral-500">{user?.username} • {user?.role}</div>
              </div>
              <button
                className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
                onClick={() => setToken(null)}
              >
                Sign out
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {allowed.map((i) => (
                <NavLink
                  key={i.to}
                  to={i.to}
                  className={({ isActive }) =>
                    [
                      "rounded-full border px-3 py-1 text-xs",
                      isActive ? "border-neutral-600 bg-neutral-900" : "border-neutral-800 text-neutral-300",
                    ].join(" ")
                  }
                >
                  {i.label}
                </NavLink>
              ))}
            </div>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
