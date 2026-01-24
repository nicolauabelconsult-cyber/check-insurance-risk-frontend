import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, updateUser } from "./mockApi";

export default function UserEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [u, setU] = useState<any>(null);

  useEffect(() => {
    if (id) getUserById(id).then(setU);
  }, [id]);

  if (!u) return <p className="sub">A carregar...</p>;

  const save = async () => {
    await updateUser(u.id, u);
    nav("/users");
  };

  return (
    <>
      <h2 className="h1">Editar Utilizador</h2>

      <div className="toolbar" style={{ justifyContent: "flex-start" }}>
        <div style={{ width: 320 }}>
          <label>Nome</label>
          <input className="input" value={u.name} onChange={(e) => setU({ ...u, name: e.target.value })} />
        </div>

        <div style={{ width: 320 }}>
          <label>Email</label>
          <input className="input" value={u.email} onChange={(e) => setU({ ...u, email: e.target.value })} />
        </div>

        <div style={{ width: 220 }}>
          <label>Role</label>
          <select value={u.role} onChange={(e) => setU({ ...u, role: e.target.value })}>
            <option value="CLIENT_ANALYST">CLIENT_ANALYST</option>
            <option value="CLIENT_ADMIN">CLIENT_ADMIN</option>
            <option value="ADMIN">ADMIN</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>
        </div>

        <div style={{ width: 180 }}>
          <label>Estado</label>
          <select value={u.status} onChange={(e) => setU({ ...u, status: e.target.value })}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <button className="btn primary" onClick={save}>Guardar</button>
        <button className="btn" onClick={() => nav("/users")}>Cancelar</button>
      </div>
    </>
  );
}
