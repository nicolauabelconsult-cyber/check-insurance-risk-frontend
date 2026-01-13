import { useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/Button";

export default function Home() {
  const { user, refreshMe, logout } = useAuth();

  useEffect(() => {
    refreshMe().catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-6">
          <div className="text-sm text-neutral-400">Logged in as</div>
          <div className="mt-1 text-lg">{user?.username ?? "..."}</div>
          <div className="mt-1 text-xs text-neutral-500">
            Role: <span className="text-neutral-300">{user?.role ?? "-"}</span>
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="secondary" onClick={() => refreshMe()}>Refresh me</Button>
            <Button variant="primary" onClick={logout}>Logout</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
