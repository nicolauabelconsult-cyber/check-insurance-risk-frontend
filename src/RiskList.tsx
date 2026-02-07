import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "./api";

export default function RiskList() {
  const [risks, setRisks] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const data = await apiFetch("/risks", { method: "GET" });
      setRisks(data);
    } catch (e: any) {
      setErr(e.message || "Erro ao carregar riscos.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <div className="toolbar">
        <div>
          <h2 className="h1">Análises de Risco</h2>
          <p className="sub">Lista carregada do backend.</p>
        </div>
        <button className="btn" onClick={load}>Atualizar</button>
        <Link className="btn primary" to="/risks/new">Nova Análise</Link>
      </div>

      {err && <div className="tag bad">{err}</div>}

      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Nacionalidade</th>
            <th>Score</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {risks.map((r) => (
            <tr key={r.id}>
              <td>{r.name || "-"}</td>
              <td>{r.nationality || "-"}</td>
              <td>{r.score || "-"}</td>
              <td>{r.status || "-"}</td>
              <td>
                <Link className="btn" to={`/risks/${r.id}`}>Ver</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
