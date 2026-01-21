import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { listSources, uploadSource } from "../api/sources";
import type { InfoSource } from "../lib/types";
import { ApiError } from "../lib/http";

export default function Sources() {
  const { token } = useAuth();
  const [items, setItems] = useState<InfoSource[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setErr(null);
    try {
      const res = await listSources(token!);
      setItems(res);
    } catch (e: any) {
      if (e instanceof ApiError) setErr(`${e.status}: ${String(e.detail)}`);
      else setErr("Erro a carregar fontes.");
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!file) return;
    setErr(null);
    setBusy(true);
    try {
      const s = await uploadSource(token!, file);
      setItems([s, ...items]);
      setFile(null);
      const inp = document.getElementById("srcfile") as HTMLInputElement | null;
      if (inp) inp.value = "";
    } catch (e: any) {
      if (e instanceof ApiError) setErr(`${e.status}: ${String(e.detail)}`);
      else setErr("Erro ao fazer upload.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid">
      <div className="card">
        <div style={{ fontWeight: 800 }}>Fontes de informação</div>
        <div className="muted" style={{ marginTop: 6 }}>
          Apenas SUPER_ADMIN/PLATFORM_ADMIN (autorizado) pode carregar fontes.
        </div>
        <div className="hr" />
        <div className="grid two">
          <div>
            <label className="label">Ficheiro (Excel)</label>
            <input id="srcfile" className="input" type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div style={{ display: "flex", alignItems: "end" }}>
            <button className="btn primary" onClick={submit} disabled={busy || !file}>
              {busy ? "A enviar..." : "Upload"}
            </button>
          </div>
        </div>
        {err && <div className="notice" style={{ marginTop: 12, borderColor: "rgba(239,68,68,.35)", color: "#fecaca" }}>{err}</div>}
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Lista</div>
        {items.length === 0 ? (
          <div className="muted">Sem fontes (ou endpoint não disponível).</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Linhas</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.row_count ?? "-"}</td>
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
