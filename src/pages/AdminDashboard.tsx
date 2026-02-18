import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";

import { api } from "../services/api"; // ajusta conforme o teu projeto

type DashboardPayload = {
  kpis: { total: number; last7d: number; last30d: number };
  byStatus: Record<string, number>;
  byBand: Record<string, number>;
  series: Array<{ date: string; risks: number; avgScore: number }>;
  topEntities: Array<{ entity_id: string; count: number }>;
  lastRisks: Array<{ id: string; entity_id: string; name: string; score: string | null; status: string; created_at: string | null }>;
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get(`/admin/dashboard?days=${days}`)
      .then((r) => mounted && setData(r.data))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [days]);

  const bandBars = useMemo(() => {
    const byBand = data?.byBand || {};
    return [
      { band: "ALTO", value: byBand["ALTO"] || 0 },
      { band: "MÉDIO", value: byBand["MÉDIO"] || 0 },
      { band: "BAIXO", value: byBand["BAIXO"] || 0 },
    ];
  }, [data]);

  if (loading) return <div style={{ padding: 16 }}>A carregar dashboard…</div>;
  if (!data) return <div style={{ padding: 16 }}>Sem dados.</div>;

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Dashboard Executivo</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>Período:</span>
          <select value={days} onChange={(e) => setDays(parseInt(e.target.value, 10))}>
            <option value={14}>14 dias</option>
            <option value={30}>30 dias</option>
            <option value={60}>60 dias</option>
            <option value={90}>90 dias</option>
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
        <KpiCard title="Total de Riscos" value={data.kpis.total} />
        <KpiCard title="Últimos 7 dias" value={data.kpis.last7d} />
        <KpiCard title="Últimos 30 dias" value={data.kpis.last30d} />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <Card title="Riscos por dia">
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={data.series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="risks" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Distribuição por Banda">
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={bandBars}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="band" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Tables */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card title="Últimos riscos">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.8 }}>
                <th>Nome</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.lastRisks.map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: "6px 0" }}>{r.name || "-"}</td>
                  <td>{r.score ?? "-"}</td>
                  <td>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Top Entidades (SUPER_ADMIN)">
          {data.topEntities?.length ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.8 }}>
                  <th>Entity</th>
                  <th>Qtd</th>
                </tr>
              </thead>
              <tbody>
                {data.topEntities.map((e) => (
                  <tr key={e.entity_id} style={{ borderTop: "1px solid #eee" }}>
                    <td style={{ padding: "6px 0" }}>{e.entity_id}</td>
                    <td>{e.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ fontSize: 12, opacity: 0.8 }}>Não aplicável / sem dados.</div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: any }) {
  return (
    <div style={{ border: "1px solid #e9e9e9", borderRadius: 10, padding: 12, background: "#fff" }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function KpiCard({ title, value }: { title: string; value: number }) {
  return (
    <div style={{ border: "1px solid #e9e9e9", borderRadius: 10, padding: 12, background: "#fff" }}>
      <div style={{ fontSize: 12, opacity: 0.75 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{value}</div>
    </div>
  );
}
