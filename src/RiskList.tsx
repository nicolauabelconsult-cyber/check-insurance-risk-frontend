import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listRisks, createRisk } from "./mockApi";

export default function RiskList() {
  const nav = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");

  const load = async () => setItems(await listRisks());

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((r) => String(r.ref).toLowerCase().includes(s) || String(r.name).toLowerCase().includes(s));
  }, [items, q]);

  const runAnalysis = async () => {
    const name = q.trim();
    if (!name) return;
    const r = await createRisk(name);
    await load();
    nav(`/risks/${r.id}`); // abre detalhe para PDF
  };

  return (
    <>
      <div className="toolbar">
        <div>
          <h2 className="h1">Análises de Risco</h2>
          <p className="sub">Pesquisar, criar e consultar resultados.</p>
        </div>
      </div>

      <div className="toolbar" style={{ justifyContent: "flex-start" }}>
        <div style={{ width: 520 }}>
          <label>Pesquisar / Nome analisado</label>
          <input
            className="input"
            style={{ width: "100%" }}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ex: João Manuel"
          />
        </div>

        <button className="btn primary" onClick={runAnalysis}>
          Pesquisar / Analisar
        </button>

        <Link className="btn" to="/risks/new">
          Nova análise (manual)
        </Link>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Ref</th>
            <th>Nome</th>
            <th>Risco</th>
            <th>Score</th>
            <th>PEP</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.id}>
              <td>{r.ref}</td>
              <td>{r.name}</td>
              <td><span className="tag warn">{r.risk_level}</span></td>
              <td>{r.score}</td>
              <td>{r.pep?.is_pep ? `Sim (${r.pep.role_or_function || "Cargo não informado"})` : "Não"}</td>
              <td>
                <Link className="btn" to={`/risks/${r.id}`}>Ver / PDF</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
