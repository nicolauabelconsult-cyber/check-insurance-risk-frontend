import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { apiFetch } from "./api";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";

type Period = "30d" | "3m" | "6m";

type DashboardSummary = {
  scope_entity_id?: string | null;

  entities: number;
  users: number;
  sources: number;

  risks_total: number;
  risks_last_200: number;

  score_avg: number;
  score_high: number;
  score_med: number;
  score_low: number;

  // optional
  latest_risks?: { id: string; name?: string | null; score?: string | null; created_at?: string | null }[];
};

type TrendPoint = { date: string; avg_score: number; count: number };
type DistPoint = { bucket: "High" | "Medium" | "Low" | string; count: number };

function formatNumber(n: number) {
  return new Intl.NumberFormat(undefined).format(n);
}

function formatDateShort(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
  } catch {
    return iso;
  }
}

function Kpi({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "ok" | "warn" | "bad" }) {
  const toneCls =
    tone === "bad" ? "tag bad" : tone === "warn" ? "tag warn" : tone === "ok" ? "tag ok" : "tag";
  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
          {hint ? <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{hint}</div> : null}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.2 }}>{value}</div>
          {tone ? <span className={toneCls}>{tone === "bad" ? "Crítico" : tone === "warn" ? "Atenção" : "Ok"}</span> : null}
        </div>
      </div>
    </div>
  );
}

function PanelTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="toolbar" style={{ marginBottom: 10 }}>
      <div>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {subtitle ? <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{subtitle}</div> : null}
      </div>
      {right ? <div>{right}</div> : null}
    </div>
  );
}

const PIE_COLORS = ["#111827", "#374151", "#6B7280"]; // neutrals

export default function ExecutiveDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  const [period, setPeriod] = useState<Period>("6m");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [dist, setDist] = useState<DistPoint[]>([]);
  const [drivers, setDrivers] = useState<{ driver: string; count: number }[]>([]);
  const [bySector, setBySector] = useState<{ sector: string; total: number; high: number; critical: number }[]>([]);
  const [idQuality, setIdQuality] = useState<{ method: string; count: number }[]>([]);
  const [underwriting, setUnderwriting] = useState<{ lateRate: number; cancelledRate: number; fraudFlags: number; totalClaims: string } | null>(null);

  const qs = useMemo(() => {
    // existing backend supports period param (see Dashboard.tsx)
    const p = period === "30d" ? "30d" : period === "3m" ? "90d" : "180d";
    return `period=${encodeURIComponent(p)}`;
  }, [period]);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);

        // Existing endpoints (confirmed in current frontend)
        const s = await apiFetch(`/dashboard/summary?${qs}`);
        const t = await apiFetch(`/dashboard/trends?${qs}&granularity=${period === "6m" ? "week" : "day"}`);
        const d = await apiFetch(`/dashboard/distribution?${qs}`);

        setSummary(s);
        setTrend(Array.isArray(t) ? t : []);
        setDist(Array.isArray(d) ? d : []);

        // Optional endpoints (if present in backend). If not, keep graceful placeholders.
        try {
          const drv = await apiFetch(`/dashboard/drivers?${qs}`);
          if (Array.isArray(drv)) setDrivers(drv);
        } catch {}
        try {
          const sec = await apiFetch(`/dashboard/by-sector?${qs}`);
          if (Array.isArray(sec)) setBySector(sec);
        } catch {}
        try {
          const iq = await apiFetch(`/dashboard/id-quality?${qs}`);
          if (Array.isArray(iq)) setIdQuality(iq);
        } catch {}
        try {
          const uw = await apiFetch(`/dashboard/underwriting?${qs}`);
          if (uw) setUnderwriting(uw);
        } catch {}
      } catch (e: any) {
        setErr(e?.message || "Falha ao carregar dashboard executivo.");
      } finally {
        setLoading(false);
      }
    })();
  }, [qs, period]);

  if (!isAdmin) {
    return (
      <div className="tag warn">
        Sem acesso ao Dashboard Executivo.
      </div>
    );
  }

  const totalAnalyses = summary?.risks_total ?? 0;
  const high = summary?.score_high ?? 0;
  const med = summary?.score_med ?? 0;
  const low = summary?.score_low ?? 0;
  const highCriticalRate = totalAnalyses ? Math.round(((high) / totalAnalyses) * 100) : 0;

  const donutData = useMemo(() => {
    // Map the distribution buckets to Portuguese labels if possible
    const map = (b: string) => (b === "High" ? "Alto" : b === "Medium" ? "Médio" : b === "Low" ? "Baixo" : b);
    return dist.map((x) => ({ name: map(x.bucket), value: x.count }));
  }, [dist]);

  const topDrivers = drivers?.length
    ? drivers.slice(0, 6)
    : [
        { driver: "PEP Nacional", count: 0 },
        { driver: "Atraso de Pagamento", count: 0 },
        { driver: "Adverse Media (Alta)", count: 0 },
        { driver: "Sinistros Elevados", count: 0 },
        { driver: "Sanções Confirmadas", count: 0 },
      ];

  const sectorRows = bySector?.length
    ? bySector
    : [
        { sector: "BANKING", total: 0, high: 0, critical: 0 },
        { sector: "INSURANCE", total: 0, high: 0, critical: 0 },
        { sector: "PENSION", total: 0, high: 0, critical: 0 },
        { sector: "BROKER", total: 0, high: 0, critical: 0 },
      ];

  const idRows = idQuality?.length
    ? idQuality
    : [
        { method: "Nome apenas", count: 0 },
        { method: "Nome + Documento", count: 0 },
      ];

  const uw = underwriting ?? { lateRate: 0, cancelledRate: 0, fraudFlags: 0, totalClaims: "0 AOA" };

  return (
    <div>
      <div className="toolbar">
        <div>
          <h2 className="h1">Dashboard Executivo</h2>
          <p className="sub">Visão consolidada (Compliance + Underwriting). Camada executiva, sem detalhe operacional.</p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div className="pill">
            Sector: <b>{summary?.scope_entity_id ? "Entidade" : "Global"}</b>
          </div>

          <select className="input" value={period} onChange={(e) => setPeriod(e.target.value as Period)} style={{ width: 160 }}>
            <option value="30d">30 dias</option>
            <option value="3m">3 meses</option>
            <option value="6m">6 meses</option>
          </select>

          <button className="btn" onClick={() => window.print()}>
            Exportar (PDF)
          </button>

          <a className="btn primary" href="/risks/new">
            Nova Análise
          </a>
        </div>
      </div>

      {loading ? <div className="tag">A carregar…</div> : null}
      {err ? <div className="tag bad">{err}</div> : null}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
        <Kpi label="Total Análises" value={formatNumber(totalAnalyses)} hint="Período selecionado" tone="ok" />
        <Kpi label="Alto" value={formatNumber(high)} hint={`${highCriticalRate}% do volume`} tone={highCriticalRate >= 10 ? "warn" : "ok"} />
        <Kpi label="Médio" value={formatNumber(med)} hint="Casos com diligência reforçada" tone="warn" />
        <Kpi label="Baixo" value={formatNumber(low)} hint="Monitorização normal" tone="ok" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: 10, marginTop: 12 }}>
        {/* Distribution */}
        <div className="card" style={{ gridColumn: "span 4", padding: 14 }}>
          <PanelTitle title="Distribuição por nível de risco" subtitle="Volume por classificação" />
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {donutData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 8 }}>
            {donutData.map((r) => (
              <div key={r.name} className="card" style={{ padding: 10 }}>
                <div style={{ fontSize: 12, opacity: 0.75 }}>{r.name}</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{formatNumber(r.value)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend */}
        <div className="card" style={{ gridColumn: "span 8", padding: 14 }}>
          <PanelTitle title="Tendência" subtitle="Análises vs Score médio" />
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend.map((x) => ({ ...x, label: formatDateShort(x.date) }))} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#111827" strokeWidth={2} dot={false} name="Análises" />
                <Line type="monotone" dataKey="avg_score" stroke="#6B7280" strokeWidth={2} dot={false} name="Score Médio" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Drivers */}
        <div className="card" style={{ gridColumn: "span 7", padding: 14 }}>
          <PanelTitle title="Principais fatores de risco" subtitle="Frequência de drivers (quando disponível)" />
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDrivers} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="driver" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#111827" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
            {topDrivers.map((d) => (
              <div key={d.driver} className="card" style={{ padding: "10px 12px", display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 700 }}>{d.driver}</div>
                <div style={{ fontWeight: 800 }}>{formatNumber(d.count)}</div>
              </div>
            ))}
          </div>

          {!drivers?.length ? (
            <div className="tag warn" style={{ marginTop: 10 }}>
              Drivers avançados: disponível quando o backend expor /dashboard/drivers.
            </div>
          ) : null}
        </div>

        {/* Sector */}
        <div className="card" style={{ gridColumn: "span 5", padding: 14 }}>
          <PanelTitle title="Exposição por sector" subtitle="Total vs Alto/Crítico (quando disponível)" />
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Sector</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                  <th style={{ textAlign: "right" }}>Alto</th>
                  <th style={{ textAlign: "right" }}>Crítico</th>
                </tr>
              </thead>
              <tbody>
                {sectorRows.map((r) => (
                  <tr key={r.sector}>
                    <td>{r.sector}</td>
                    <td style={{ textAlign: "right" }}>{formatNumber(r.total)}</td>
                    <td style={{ textAlign: "right" }}>{formatNumber(r.high)}</td>
                    <td style={{ textAlign: "right" }}>{formatNumber(r.critical)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!bySector?.length ? (
            <div className="tag warn" style={{ marginTop: 10 }}>
              Exposição por sector: disponível quando o backend expor /dashboard/by-sector.
            </div>
          ) : null}
        </div>

        {/* Underwriting */}
        <div className="card" style={{ gridColumn: "span 7", padding: 14 }}>
          <PanelTitle title="Underwriting" subtitle="Indicadores comportamentais (Seguros)" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
            <Kpi label="% com atraso" value={`${uw.lateRate}%`} hint="Pagamentos fora do prazo" tone={uw.lateRate >= 10 ? "warn" : "ok"} />
            <Kpi label="% canceladas" value={`${uw.cancelledRate}%`} hint="Apólices encerradas" tone={uw.cancelledRate >= 8 ? "warn" : "ok"} />
            <Kpi label="Flags de fraude" value={formatNumber(uw.fraudFlags)} hint="Sinais/ocorrências" tone={uw.fraudFlags > 0 ? "warn" : "ok"} />
            <Kpi label="Total sinistros" value={uw.totalClaims} hint="Montante agregado" tone="ok" />
          </div>

          {!underwriting ? (
            <div className="tag warn" style={{ marginTop: 10 }}>
              Underwriting: disponível quando o backend expor /dashboard/underwriting.
            </div>
          ) : null}
        </div>

        {/* Identity quality */}
        <div className="card" style={{ gridColumn: "span 5", padding: 14 }}>
          <PanelTitle title="Qualidade de Identificação" subtitle="Nome apenas vs Nome + Documento" />
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={idRows} dataKey="count" nameKey="method" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  <Cell fill="#111827" />
                  <Cell fill="#9CA3AF" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
            {idRows.map((m) => (
              <div key={m.method} className="card" style={{ padding: "10px 12px", display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 700 }}>{m.method}</div>
                <div style={{ fontWeight: 800 }}>{formatNumber(m.count)}</div>
              </div>
            ))}
          </div>

          {!idQuality?.length ? (
            <div className="tag warn" style={{ marginTop: 10 }}>
              Qualidade de identificação: disponível quando o backend expor /dashboard/id-quality.
            </div>
          ) : null}
        </div>
      </div>

      {/* Governance note */}
      <div className="card" style={{ padding: 14, marginTop: 12 }}>
        <PanelTitle title="Notas de governação" subtitle="Boas práticas para auditoria e apresentação institucional" />
        <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.85 }}>
          <li>Este painel é executivo: não expõe BI/Passaporte completos nem evidências brutas.</li>
          <li>Filtros devem respeitar multi-tenant e RBAC (SUPER_ADMIN vs ADMIN/CLIENT).</li>
          <li>Drivers/Underwriting/Qualidade de ID devem ser auditáveis via evidências guardadas no Risk.</li>
        </ul>
      </div>
    </div>
  );
}
