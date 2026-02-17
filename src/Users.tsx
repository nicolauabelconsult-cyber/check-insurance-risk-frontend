import { useEffect, useState } from "react";
import { listUsers } from "./mockApi";
import { Link } from "react-router-dom";

export default function Users() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    listUsers().then(setData);
  }, []);

  return (
    <>
      <div className="toolbar">
        <div>
          <h2 className="h1">Utilizadores</h2>
          <p className="sub">Gestão interna da plataforma.</p>
        </div>

        <div className="stack">
          <Link className="btn primary" to="/users/new">Criar Utilizador</Link>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Nome</th><th>Email</th><th>Role</th><th>Estado</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td><span className="tag">{u.role}</span></td>
              <td><span className={`tag ${u.status === "ACTIVE" ? "ok" : "warn"}`}>{u.status}</span></td>
              <td>
                <Link className="btn" to={`/users/${u.id}`}>Editar</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
