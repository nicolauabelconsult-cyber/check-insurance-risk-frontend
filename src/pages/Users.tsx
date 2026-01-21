import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { createUser, listUsers } from "../api/users";
import type { Role, User } from "../lib/types";
import { ApiError } from "../lib/http";

export default function Users() {
  const { token } = useAuth();
  const [items, setItems] = useState<User[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("PLATFORM_ADMIN");
  const [entityId, setEntityId] = useState<string>("");

  const load = async () => {
    setErr(null);
    try {
      const res = await listUsers(token!);
      setItems(res);
    } catch (e: any) {
      if (e instanceof ApiError) setErr(`${e.status}: ${String(e.detail)}`);
      else setErr("Erro a carregar utilizadores.");
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    setErr(null);
    setBusy(true);
    try {
      const payload: any = { username: username.trim(), password, role };
      payload.entity_id = entityId ? Number(entityId) : null;
      const u = await createUser(token!, payload);
      setItems([u, ...items]);
      setUsername(""); setPassword(""); setEntityId("");
    } catch (e: any) {
      if (e instanceof ApiError) setErr(`${e.status}: ${String(e.detail)}`);
      else setErr("Erro ao criar utilizador.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid">
      <div className="card">
        <div style={{ fontWeight: 800 }}>Utilizadores</div>
        <div className="muted" style={{ marginTop: 6 }}>
          SUPER_ADMIN cria PLATFORM_ADMIN e utilizadores de clientes (CLIENT_ADMIN/CLIENT_ANALYST).
        </div>
        <div className="hr" />

        <div className="grid two">
          <div>
            <label className="label">Username</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
              <option value="CLIENT_ADMIN">CLIENT_ADMIN</option>
              <option value="CLIENT_ANALYST">CLIENT_ANALYST</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
              Nota: só use SUPER_ADMIN para a conta principal.
            </div>
          </div>
          <div>
            <label className="label">Entity ID (para clientes)</label>
            <input className="input" value={entityId} onChange={(e) => setEntityId(e.target.value)} placeholder="Ex: 1" />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="btn primary" onClick={submit} disabled={busy || !username.trim() || !password}>
            {busy ? "A criar..." : "Criar utilizador"}
          </button>
        </div>

        {err && <div className="notice" style={{ marginTop: 12, borderColor: "rgba(239,68,68,.35)", color: "#fecaca" }}>{err}</div>}
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Lista</div>
        {items.length === 0 ? (
          <div className="muted">Sem utilizadores (ou endpoint não disponível).</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Entity</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td><span className="badge">{u.role}</span></td>
                  <td>{u.entity_id ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="hr" />
        <button className="btn" onClick={load}>Recarregar</button>
      </div>
    </div>
  );
}
