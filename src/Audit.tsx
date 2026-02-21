import { useEffect, useMemo, useState } from "react";
import { listAudit } from "./mockApi";

export default function Audit() {
  const [data, setData] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [action, setAction] = useState("ALL");

  useEffect(() => {
    listAudit().then(setData);
  }, []);

  const actions = useMemo(() => {
    const set = new Set<string>();
    data.forEach((a) => set.add(a.action));
    return ["ALL", ...Array.from(set)];
  }, [data]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.filter((a) => {
      const okAction = action === "ALL" ? true : a.action === action;
      const blob = `${a.action} ${a.actor?.name ?? ""} ${a.entity_name ?? ""} ${a.target_ref ?? ""}`.toLowerCase();
      const okQ = !s ? true : blob.includes(s);
      return okAction && okQ;
    });
  }, [data, q, action]);

  const printReport = () => {
    window.print();
  };

  return (
    <>
      <div className="toolbar">
        <div>
          <h2 className="h1">Auditoria</h2>
          <p className="sub">Rastreabilidade completa (ações e eventos).</p>
        </div>
        <button className="btn primary" onClick={printReport}>
          Imprimir relatório
        </button>
      </div>

      <div className="toolbar" style={{ justifyContent: "flex-start" }}>
        <div style={{ width: 420 }}>
          <label>Pesquisar</label>
          <input
            className="input"
            style={{ width: "100%" }}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ex: USER_CREATED, Nicolau Abel, RISK-2026..."
          />
        </div>

        <div style={{ width: 240 }}>
          <label>Ação</label>
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            {actions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <table className="table" id="audit-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Ação</th>
            <th>Utilizador</th>
            <th>Entidade</th>
            <th>Referência</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((l) => (
            <tr key={l.id}>
              <td>{new Date(l.created_at).toLocaleString()}</td>
              <td><span className="tag">{l.action}</span></td>
              <td>{l.actor?.name ?? "-"}</td>
              <td>{l.entity_name ?? "-"}</td>
              <td>{l.target_ref ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Print styling */}
      <style>{`
        @media print {
          body { background: #fff !important; color: #000 !important; }
          .header, .nav, .btn, .pill { display: none !important; }
          .card { box-shadow: none !important; border: none !important; }
          .table { border: 1px solid #ddd !important; background: #fff !important; }
          .table th, .table td { color: #000 !important; border-bottom: 1px solid #eee !important; }
          .tag { border: 1px solid #ccc !important; background: #fff !important; color: #000 !important; }
        }
      `}</style>
    </>
  );
}
