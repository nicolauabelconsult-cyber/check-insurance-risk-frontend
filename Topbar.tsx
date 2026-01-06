import { useAuth } from "../auth/AuthContext";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { apiBaseUrl } from "../lib/env";

export default function Topbar(){
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/85 backdrop-blur px-6 py-4">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-sm text-neutral-300">Enterprise Risk Console</div>
          <div className="mt-1 text-xs text-neutral-600 truncate">API: {apiBaseUrl()}</div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="text-right">
              <div className="text-sm font-medium text-neutral-100 truncate max-w-[260px]">{user.name || user.username}</div>
              <div className="mt-1 flex items-center justify-end gap-2 text-xs text-neutral-500">
                <Badge tone="neutral">{user.role}</Badge>
                {typeof user.is_active !== "undefined" && <Badge tone={user.is_active === false ? "bad" : "good"}>{user.is_active === false ? "DISABLED" : "ACTIVE"}</Badge>}
              </div>
            </div>
          )}
          <Button variant="ghost" onClick={logout}>Logout</Button>
        </div>
      </div>
    </header>
  );
}
