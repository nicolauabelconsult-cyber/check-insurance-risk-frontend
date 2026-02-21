import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { apiFetch } from "./api";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";

type Period = "7d" | "30d" | "90d" | "12m";

type LatestRisk = {
  id: string;
  entity_id: string;
  name?: string | null;
  score?: string | null;
  status?: string | null;
  created_at?: string | null;
};

type TopAction = {
  action: string;
  count: number;
};

type LatestEvent = {
  id: string;
  action: string;
  actor_name: string;
  entity_id?: string | null;
  entity_name?: string | null;
  target_ref?: string | null;
  created_at?: string | null;
};

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

  latest_risks: LatestRisk[];
  top_actions: TopAction[];
  latest_events: LatestEvent[];

  // compat: pode existir ou não
  series_30d?: { date: string; count: number }[];
};

type TrendPoint = { date: string; avg_score: number; count: number };
type DistPoint = { bucket: "High" | "Medium" | "Low"; count: number };

function formatDateShort(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
  } catch {
    return iso;
  }
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
          {hint ? <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{hint}</div> : null}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.2 }}>{value}</div>
      </div>
    </div>
  );
}

function PanelTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 800 }}>{title}</div>
      {subtitle ? <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>{subtitle}</div> : null}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  // Exclusivo para SUPER_ADMIN/ADMIN
  const allowed = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  if (!allowed) return <Navigate to="/risks" replace />;

  // Filtros executivos
  const [period, setPeriod] = useState<Period>("30d");
  const [entityId, setEntityId] = useState<string>(""); // opcional (Super/Admin)

  // Dados
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [distribution, setDistribution] = useState<DistPoint[]>([]);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    p.set("period", period);
    if (entityId.trim()) p.set("entity_id", entityId.trim());
    return p.toString();
  }, [period, entityId]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);

      try {
        const [s, t, d] = await Promise.all([
          apiFetch(`/dashboard/summary?${qs}`),
          apiFetch(`/dashboard/trends?${qs}&granularity=${period === "12m" ? "week" : "day"}`),
          apiFetch(`/dashboard/distribution?${qs}`),
        ]);

        if (!alive) return;

        // Summary: validação leve e fallback seguro (mantém compatibilidade)
        const safe: DashboardSummary = {
          scope_entity_id: s?.scope_entity_id ?? null,

          entities: Number(s?.entities ?? 0),
          users: Number(s?.users ?? 0),
          sources: Number(s?.sources ?? 0),

          risks_total: Number(s?.risks_total ?? 0),
          risks_last_200: Number(s?.risks_last_200 ?? 0),

          score_avg: Number(s?.score_avg ?? 0),
          score_high: Number(s?.score_high ?? 0),
          score_med: Number(s?.score_med ?? 0),
          score_low: Number(s?.score_low ?? 0),

          latest_risks: Array.isArray(s?.latest_risks) ? (s.latest_risks as LatestRisk[]) : [],
          top_actions: Array.isArray(s?.top_actions) ? (s.top_actions as TopAction[]) : [],
          latest_events: Array.isArray(s?.latest_events) ? (s.latest_events as LatestEvent[]) : [],

          series_30d: Array.isArray(s?.series_30d) ? s.series_30d : [],
        };

        setSummary(safe);

        // Trends / Distribution: fallback seguro
        setTrends(Array.isArray(t) ? (t as TrendPoint[]) : []);
        setDistribution(Array.isArray(d) ? (d as DistPoint[]) : []);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || String(e));
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [qs, period]);

  const stats = useMemo(() => {
    const s = summary;
    if (!s) {
      return { avg: 0, high: 0, med: 0, low: 0, topActions: [] as [string, number][] };
    }
    const topActions: [string, number][] = (s.top_actions || []).map((x) => [x.action, x.count]);
    return {
      avg: s.score_avg || 0,
      high: s.score_high || 0,
      med: s.score_med || 0,
      low: s.score_low || 0,
      topActions,
    };
  }, [summary]);

  // Para o gráfico de distribuição
  const distTotal = useMemo(() => distribution.reduce((acc, x) => acc + (x.count || 0), 0), [distribution]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Dashboard Executivo</h2>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            Vista rápida de operação, risco e auditoria (apenas SUPER_ADMIN/ADMIN).
          </div>
          {summary?.scope_entity_id ? (
            <div style={{ fontSize: 12, opacity: 0.65, marginTop: 4 }}>
              Escopo: <code>{summary.scope_entity_id}</code>
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 12, opacity: 0.65 }}>
            Backend: <code>{import.meta.env.VITE_API_URL || "(VITE_API_URL não definido)"}</code>
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="input"
            style={{ height: 34 }}
            title="Período"
          >
            <option value="7d">7 dias</option>
            <option value="30d">30 dias</option>
            <option value="90d">90 dias</option>
            <option value="12m">12 meses</option>
          </select>

          <input
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            placeholder="Entity ID (opcional)"
            className="input"
            style={{ height: 34, width: 260 }}
          />
        </div>
      </div>

      {/* States */}
      {loading ? (
        <p style={{ marginTop: 14 }}>A carregar…</p>
      ) : err ? (
        <div className="card" style={{ marginTop: 14, borderLeft: "4px solid #b91c1c", padding: 12 }}>
          <b>Falha ao carregar o dashboard</b>
          <div style={{ marginTop: 6, fontFamily: "monospace", fontSize: 12, opacity: 0.85 }}>{err}</div>
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 10,
              marginTop: 14,
            }}
          >
            <Kpi label="Entidades" value={String(summary?.entities ?? 0)} hint="Clientes / organizações" />
            <Kpi label="Utilizadores" value={String(summary?.users ?? 0)} hint="Total no sistema" />
            <Kpi label="Fontes" value={String(summary?.sources ?? 0)} hint="Fontes ativas/configuradas" />
            <Kpi label="Análises (últimas 200)" value={String(summary?.risks_last_200 ?? 0)} hint="Registos recentes" />
            <Kpi
              label="Score médio"
              value={`${Number(stats.avg).toFixed(0)}/100`}
              hint={`Alto: ${stats.high} • Médio: ${stats.med} • Baixo: ${stats.low}`}
            />
          </div>

          {/* Charts row */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: 12, marginTop: 14 }}>
            <div className="card" style={{ padding: 14 }}>
              <PanelTitle title="Tendência de score" subtitle="Média por período (auditável) + volume de análises" />
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(v) => formatDateShort(String(v))} minTickGap={16} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      labelFormatter={(v) => `Data: ${formatDateShort(String(v))}`}
                      formatter={(value: any, name: any) => {
                        if (name === "avg_score") return [`${value}`, "Score médio"];
                        if (name === "count") return [`${value}`, "Qtd. análises"];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="avg_score" name="Score médio" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="count" name="Qtd. análises" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.65 }}>
                Dica: Em 12 meses usamos agregação semanal automaticamente para leitura executiva.
              </div>
            </div>

            <div className="card" style={{ padding: 14 }}>
              <PanelTitle title="Distribuição de risco" subtitle="High / Medium / Low" />
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bucket" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Qtd." />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.65 }}>
                Total no período: <b>{distTotal}</b>
              </div>
            </div>
          </div>

          {/* Tables row */}
          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 12, marginTop: 14 }}>
            <div className="card" style={{ padding: 14 }}>
              <PanelTitle title="Últimas análises" subtitle="Amostra recente (máx. 10)" />
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Entity</th>
                  </tr>
                </thead>
                <tbody>
                  {(summary?.latest_risks || []).slice(0, 10).map((r) => (
                    <tr key={r.id}>
                      <td style={{ maxWidth: 260 }}>{r.name || "-"}</td>
                      <td>{r.score || "-"}</td>
                      <td>{r.status || "-"}</td>
                      <td style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.8 }}>{r.entity_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card" style={{ padding: 14 }}>
              <PanelTitle title="Top ações de auditoria" subtitle="Top eventos no período" />

              {stats.topActions.length ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Ação</th>
                      <th>Qtd.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topActions.map(([k, v]) => (
                      <tr key={k}>
                        <td style={{ fontFamily: "monospace", fontSize: 12 }}>{k}</td>
                        <td>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ fontSize: 12, opacity: 0.7 }}>Sem eventos disponíveis.</div>
              )}

              <div style={{ marginTop: 12 }}>
                <PanelTitle title="Últimos eventos" subtitle="Rasto de auditoria (máx. 6)" />
                <div style={{ display: "grid", gap: 8 }}>
                  {(summary?.latest_events || []).slice(0, 6).map((a) => (
                    <div key={a.id} className="card" style={{ padding: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ fontFamily: "monospace", fontSize: 12 }}>{a.action}</div>
                        <div style={{ fontSize: 11, opacity: 0.65 }}>
                          {a.created_at ? new Date(a.created_at).toLocaleString() : "-"}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                        {a.actor_name}
                        {a.target_ref ? <span style={{ opacity: 0.7 }}> • {a.target_ref}</span> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 12, fontSize: 12, opacity: 0.65 }}>
                Este painel é “board-ready”: tendências, distribuição e auditoria são derivadas do backend e auditáveis.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
