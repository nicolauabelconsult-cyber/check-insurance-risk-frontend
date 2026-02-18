import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "./api";
import { useAuth } from "./AuthContext";

type Risk = {
  id: string;
  entity_id: string;
  name?: string | null;
  bi?: string | null;
  passport?: string | null;
  nationality?: string | null;
  score?: string | null;
  summary?: string | null;
  matches: any[];
  status: string;
  created_at?: string | null;
};

export default function RiskList() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Risk[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    apiFetch("/risks")
      .then((data) => {
        if (mounted) setRows(data || []);
      })
      .catch((e: any) => {
        if (mounted) setErr(e?.message || "Erro ao carregar análises");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 className="h1">Análises de Risco</h2>
          <p className="sub">
            {user?.entity ? `Entidade: ${user.entity.name}` : "Selecione uma entidade ao criar (SUPER/ADMIN)."}
          </p>
        </div>
        <Link className="btn primary" to="/risks/new">
          Nova Análise
        </Link>
      </div>

      {err && <div className="tag bad">{err}</div>}

      <div className="card" style={{ marginTop: 12, padding: 12 }}>
        {loading ? (
          <div className="sub">A carregar…</div>
        ) : rows.length === 0 ? (
          <div className="sub">Sem análises ainda.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Doc</th>
                <th>Nacionalidade</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ cursor: "pointer" }}>
                  <td>
                    <Link to={`/risks/${r.id}`}>{r.name || "(sem nome)"}</Link>
                  </td>
                  <td>{r.bi || r.passport || "-"}</td>
                  <td>{r.nationality || "-"}</td>
                  <td>{r.score || "-"}</td>
                  <td>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
