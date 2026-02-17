import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { apiFetch } from "./api";

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

  // opcional (para Recharts mais tarde)
  series_30d?: { date: string; count: number }[];
};

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

export default function Dashboard() {
  const { user } = useAuth();

  // Exclusivo para SUPER_ADMIN/ADMIN (como pediste).
  const allowed = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  if (!allowed) return <Navigate to="/risks" replace />;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const r = await apiFetch("/dashboard/summary");
        if (!alive) return;

        // validação leve e fallback seguro
        const safe: DashboardSummary = {
          scope_entity_id: r?.scope_entity_id ?? null,

          entities: Number(r?.entities ?? 0),
          users: Number(r?.users ?? 0),
          sources: Number(r?.sources ?? 0),

          risks_total: Number(r?.risks_total ?? 0),
          risks_last_200: Number(r?.risks_last_200 ?? 0),

          score_avg: Number(r?.score_avg ?? 0),
          score_high: Number(r?.score_high ?? 0),
          score_med: Number(r?.score_med ?? 0),
          score_low: Number(r?.score_low ?? 0),

          latest_risks: Array.isArray(r?.latest_risks) ? (r.latest_risks as LatestRisk[]) : [],
          top_actions: Array.isArray(r?.top_actions) ? (r.top_actions as TopAction[]) : [],
          latest_events: Array.isArray(r?.latest_events) ? (r.latest_events as LatestEvent[]) : [],

          series_30d: Array.isArray(r?.series_30d) ? r.series_30d : [],
        };

        setSummary(safe);
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
  }, []);

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

  return (
    <div>
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
        <div style={{ fontSize: 12, opacity: 0.65 }}>
          Backend: <code>{import.meta.env.VITE_API_URL || "(VITE_API_URL não definido)"}</code>
        </div>
      </div>

      {loading ? (
        <p style={{ marginTop: 14 }}>A carregar…</p>
      ) : err ? (
        <div className="card" style={{ marginTop: 14, borderLeft: "4px solid #b91c1c", padding: 12 }}>
          <b>Falha ao carregar o dashboard</b>
          <div style={{ marginTop: 6, fontFamily: "monospace", fontSize: 12, opacity: 0.85 }}>{err}</div>
        </div>
      ) : (
        <>
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

          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 12, marginTop: 14 }}>
            <div className="card" style={{ padding: 14 }}>
              <h3 style={{ marginTop: 0 }}>Últimas análises</h3>
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
              <h3 style={{ marginTop: 0 }}>Top ações de auditoria</h3>
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
                <h3 style={{ marginTop: 0 }}>Últimos eventos</h3>
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
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.65 }}>
            Se quiseres um painel “board-level” (KPIs por período, tendências, gráficos, export), fazemos a v2.0 por cima destes mesmos endpoints.
          </div>
        </>
      )}
    </div>
  );
}
