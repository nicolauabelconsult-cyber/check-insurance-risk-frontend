import { useEffect, useState } from "react";
import { listAudit } from "./mockApi";

export default function Audit() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    listAudit().then(setData);
  }, []);

  return (
    <>
      <h2>Auditoria</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th><th>Ação</th><th>Utilizador</th><th>Entidade</th><th>Referência</th>
          </tr>
        </thead>
        <tbody>
          {data.map((l) => (
            <tr key={l.id}>
              <td>{new Date(l.created_at).toLocaleString()}</td>
              <td>{l.action}</td>
              <td>{l.actor?.name}</td>
              <td>{l.entity_name || "-"}</td>
              <td>{l.target_ref || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
