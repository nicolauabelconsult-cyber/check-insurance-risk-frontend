import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../api/dashboard";

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-5">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value ?? "-"}</div>
    </div>
  );
}

export default function Overview() {
  const q = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });

  const d = q.data || {};

  return (
    <div className="space-y-6">
      <div>
        <div className="text-lg font-semibold">Overview</div>
        <div className="text-sm text-neutral-500">Operational summary and key indicators.</div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Users" value={d.users} />
        <Stat label="Entities" value={d.entities} />
        <Stat label="Info Sources" value={d.info_sources} />
        <Stat label="Total Analyses" value={d.total_analyses} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Low risk" value={d.low_risk} />
        <Stat label="Medium risk" value={d.medium_risk} />
        <Stat label="High risk" value={d.high_risk} />
        <Stat label="Critical risk" value={d.critical_risk} />
      </div>

      <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-5">
        <div className="text-sm font-semibold">Notes</div>
        <div className="mt-2 text-sm text-neutral-400">
          This console enforces RBAC. If you don’t see a module, your role is not authorized.
        </div>
        {q.isError && (
          <div className="mt-3 text-xs text-red-200">
            Failed to load dashboard. Confirm VITE_API_URL and backend endpoints.
          </div>
        )}
      </div>
    </div>
  );
}
