import { useEffect, useState } from "react";
import { listUsers } from "./mockApi";

export default function Users() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    listUsers().then(setData);
  }, []);

  return (
    <>
      <h2>Utilizadores</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th><th>Email</th><th>Role</th><th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
