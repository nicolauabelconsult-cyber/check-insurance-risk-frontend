import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { apiFetch } from "./api";

type RiskOut = {
  id: string;
  entity_id: string;
  name?: string | null;
  nationality?: string | null;
  bi?: string | null;
  passport?: string | null;
  score?: string | null;
  summary?: string | null;
  status?: string | null;
};

type UserOut = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  entity_id?: string | null;
};

type EntityOut = {
  id: string;
  name: string;
  type: string;
  status: string;
};

type SourceOut = {
  id: string;
  entity_id: string;
  name: string;
  category: string;
  collected_from: string;
  status: string;
};

type AuditOut = {
  id: string;
  action: string;
  actor_name: string;
  entity_name?: string | null;
  target_ref?: string | null;
  meta?: Record<string, any>;
  created_at: string;
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
  const [risks, setRisks] = useState<RiskOut[]>([]);
  const [users, setUsers] = useState<UserOut[]>([]);
  const [entities, setEntities] = useState<EntityOut[]>([]);
  const [sources, setSources] = useState<SourceOut[]>([]);
  const [audit, setAudit] = useState<AuditOut[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [rRisks, rUsers, rEntities, rSources, rAudit] = await Promise.all([
          apiFetch("/risks"),
          apiFetch("/users"),
          apiFetch("/entities"),
          apiFetch("/sources"),
          apiFetch("/audit?limit=200"),
        ]);

        if (!alive) return;
        setRisks(Array.isArray(rRisks) ? (rRisks as RiskOut[]) : []);
        setUsers(Array.isArray(rUsers) ? (rUsers as UserOut[]) : []);
        setEntities(Array.isArray(rEntities) ? (rEntities as EntityOut[]) : []);
        setSources(Array.isArray(rSources) ? (rSources as SourceOut[]) : []);
        setAudit(Array.isArray(rAudit) ? (rAudit as AuditOut[]) : []);
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
    const scores = (risks || [])
      .map((r) => {
        const n = Number(r.score ?? "");
        return Number.isFinite(n) ? n : null;
      })
      .filter((x): x is number => x !== null);

    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const high = scores.filter((s) => s >= 80).length;
    const med = scores.filter((s) => s >= 60 && s < 80).length;
    const low = scores.filter((s) => s < 60).length;

    const actionCounts: Record<string, number> = {};
    for (const a of audit || []) {
      const k = (a.action || "-").toString();
      actionCounts[k] = (actionCounts[k] || 0) + 1;
    }

    const topActions = Object.entries(actionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return { avg, high, med, low, topActions };
  }, [risks, audit]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Dashboard Executivo</h2>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            Vista rápida de operação, risco e auditoria (apenas SUPER_ADMIN/ADMIN).
          </div>
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
            <Kpi label="Entidades" value={String(entities.length)} hint="Clientes / organizações" />
            <Kpi label="Utilizadores" value={String(users.length)} hint="Total no sistema" />
            <Kpi label="Fontes" value={String(sources.length)} hint="Fontes ativas/configuradas" />
            <Kpi label="Análises (últimas 200)" value={String(risks.length)} hint="Registos recentes" />
            <Kpi
              label="Score médio"
              value={`${stats.avg.toFixed(0)}/100`}
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
                  {(risks || []).slice(0, 10).map((r) => (
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
                  {(audit || []).slice(0, 6).map((a) => (
                    <div key={a.id} className="card" style={{ padding: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ fontFamily: "monospace", fontSize: 12 }}>{a.action}</div>
                        <div style={{ fontSize: 11, opacity: 0.65 }}>{new Date(a.created_at).toLocaleString()}</div>
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
