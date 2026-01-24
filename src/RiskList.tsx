import { Link } from "react-router-dom";
import { listRisks } from "./mockApi";
import { useEffect, useState } from "react";

export default function RiskList() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    listRisks().then(setData);
  }, []);

  return (
    <>
      <h2>Análises de Risco</h2>
      <Link to="/risks/new">Nova análise</Link>
      <table>
        <thead>
          <tr>
            <th>Ref</th>
            <th>Nome</th>
            <th>Risco</th>
            <th>Score</th>
            <th>PEP</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.id}>
              <td><Link to={`/risks/${r.id}`}>{r.ref}</Link></td>
              <td>{r.name}</td>
              <td>{r.risk_level}</td>
              <td>{r.score}</td>
              <td>{r.pep?.is_pep ? `Sim (${r.pep.role_or_function || "Sem cargo"})` : "Não"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
