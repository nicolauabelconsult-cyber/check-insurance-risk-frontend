import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { createEntity, listEntities } from "../api/entities";
import type { Entity } from "../lib/types";
import { ApiError } from "../lib/http";

export default function Entities() {
  const { token } = useAuth();
  const [items, setItems] = useState<Entity[]>([]);
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setErr(null);
    try {
      const res = await listEntities(token!);
      setItems(res);
    } catch (e: any) {
      setItems([]);
      if (e instanceof ApiError) setErr(`${e.status}: ${String(e.detail)}`);
      else setErr("Erro a carregar entidades.");
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    setErr(null);
    setBusy(true);
    try {
      const e = await createEntity(token!, name.trim());
      setName("");
      setItems([e, ...items]);
    } catch (e: any) {
      if (e instanceof ApiError) setErr(`${e.status}: ${String(e.detail)}`);
      else setErr("Erro ao criar entidade.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid">
      <div className="card">
        <div style={{ fontWeight: 800 }}>Entidades</div>
        <div className="muted" style={{ marginTop: 6 }}>Cada cliente pertence a uma entidade (segregação por entidade).</div>
        <div className="hr" />
        <div className="grid two">
          <div>
            <label className="label">Nome da entidade</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Banco X" />
          </div>
          <div style={{ display: "flex", alignItems: "end" }}>
            <button className="btn primary" onClick={submit} disabled={busy || !name.trim()}>
              {busy ? "A criar..." : "Criar entidade"}
            </button>
          </div>
        </div>
        {err && <div className="notice" style={{ marginTop: 12, borderColor: "rgba(239,68,68,.35)", color: "#fecaca" }}>{err}</div>}
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Lista</div>
        {items.length === 0 ? (
          <div className="muted">Sem dados (ou endpoint de listagem não disponível).</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>{e.name}</td>
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
