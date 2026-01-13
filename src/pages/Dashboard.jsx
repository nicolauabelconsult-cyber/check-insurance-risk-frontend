import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { getStats } from "../api/dashboard";
import { friendlyError } from "../lib/httpError";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Badge from "../components/ui/Badge";

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-neutral-900 bg-neutral-950 p-4">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value ?? "-"}</div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await getStats();
      setData(d);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat label="Users" value={data?.users} />
        <Stat label="Data sources" value={data?.info_sources} />
        <Stat label="Total analyses" value={data?.total_analyses} />
        <Stat label="High risk" value={data?.high_risk} />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Risk distribution</div>
            <div className="text-xs text-neutral-500">Based on stored analyses.</div>
          </div>
          <Badge tone="neutral">{loading ? "Loading" : "Live"}</Badge>
        </CardHeader>
        <CardBody>
          <div className="grid gap-4 md:grid-cols-4">
            <Stat label="LOW" value={data?.low_risk} />
            <Stat label="MEDIUM" value={data?.medium_risk} />
            <Stat label="HIGH" value={data?.high_risk} />
            <Stat label="CRITICAL" value={data?.critical_risk} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
