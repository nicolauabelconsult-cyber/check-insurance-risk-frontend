import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser, listEntities } from "./mockApi";

export default function UserCreate() {
  const nav = useNavigate();

  const [entities, setEntities] = useState<any[]>([]);
  useEffect(() => { listEntities().then(setEntities); }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [entityId, setEntityId] = useState("");
  const [role, setRole] = useState("CLIENT_ANALYST");
  const [status, setStatus] = useState("ACTIVE");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (!name.trim() || !email.trim() || !password.trim() || !entityId) {
      setErr("Preencha nome, email, entidade e password.");
      return;
    }
    await createUser({ name, email, entity_id: entityId, role, status, password });
    nav("/users");
  };

  return (
    <>
      <h2 className="h1">Criar Utilizador</h2>
      <p className="sub">O utilizador é criado já associado a uma Entidade (cliente).</p>

      <div className="toolbar" style={{ justifyContent: "flex-start" }}>
        <div style={{ width: 280 }}>
          <label>Nome</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div style={{ width: 320 }}>
          <label>Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div style={{ width: 260 }}>
          <label>Entidade</label>
          <select value={entityId} onChange={(e) => setEntityId(e.target.value)}>
            <option value="">Selecionar...</option>
            {entities.map((x) => (
              <option key={x.id} value={x.id}>{x.name}</option>
            ))}
          </select>
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

        <div style={{ width: 240 }}>
          <label>Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button className="btn primary" onClick={submit}>Guardar</button>
        <button className="btn" onClick={() => nav("/users")}>Cancelar</button>

        {err && <span className="tag bad">{err}</span>}
      </div>
    </>
  );
}
