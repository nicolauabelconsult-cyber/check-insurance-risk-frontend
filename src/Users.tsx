import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "./mockApi";

export default function UserCreate() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("CLIENT_ANALYST");
  const [status, setStatus] = useState("ACTIVE");

  const submit = async () => {
    await createUser({ name, email, role, status });
    nav("/users");
  };

  return (
    <>
      <h2 className="h1">Criar Utilizador</h2>
      <p className="sub">Criação controlada por RBAC.</p>

      <div className="toolbar" style={{ justifyContent: "flex-start" }}>
        <div style={{ width: 320 }}>
          <label>Nome</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div style={{ width: 320 }}>
          <label>Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div style={{ width: 220 }}>
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="CLIENT_ANALYST">CLIENT_ANALYST</option>
            <option value="CLIENT_ADMIN">CLIENT_ADMIN</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div style={{ width: 180 }}>
          <label>Estado</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <button className="btn primary" onClick={submit}>Guardar</button>
        <button className="btn" onClick={() => nav("/users")}>Cancelar</button>
      </div>
    </>
  );
}
