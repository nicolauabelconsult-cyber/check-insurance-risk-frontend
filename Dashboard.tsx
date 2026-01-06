import { useQuery } from "@tanstack/react-query";
import { getStats } from "../api/dashboard";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

function KPI({ label, value, loading }:{ label:string; value:any; loading:boolean }){
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-neutral-100">
        {loading ? <span className="inline-block h-7 w-20 animate-pulse rounded bg-white/10" /> : (value ?? "-")}
      </div>
    </div>
  );
}

export default function Dashboard(){
  const q = useQuery({ queryKey:["dashboard","stats"], queryFn:getStats });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="mt-1 text-xs text-neutral-500">Operational overview.</div>
        </div>
        <Badge tone={q.isError ? "bad" : "good"}>{q.isLoading ? "Loading" : "Live"}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <KPI label="Total analyses" value={q.data?.total_analyses} loading={q.isLoading} />
        <KPI label="Total clients" value={q.data?.total_clients} loading={q.isLoading} />
        <KPI label="High risk" value={q.data?.high_risk} loading={q.isLoading} />
        <KPI label="Critical risk" value={q.data?.critical_risk} loading={q.isLoading} />
      </div>

      <Card>
        <CardHeader>
          <div className="text-sm font-semibold">Notes</div>
          <div className="mt-1 text-xs text-neutral-500">Audit-friendly console design: clarity and controlled actions.</div>
        </CardHeader>
        <CardBody>
          <div className="text-sm text-neutral-300">
            Next: cases workflow, evidence packs, and escalation review.
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
