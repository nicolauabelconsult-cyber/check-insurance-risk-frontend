import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login as apiLogin } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../lib/http";
import { apiBaseUrl } from "../lib/env";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation() as any;
  const from = loc.state?.from?.pathname ?? "/";

  const { setToken, refreshMe } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await apiLogin(username.trim(), password);
      setToken(res.access_token);
      await refreshMe();
      nav(from, { replace: true });
    } catch (err: any) {
      if (err instanceof ApiError) setError(`${err.status}: ${String(err.detail)}`);
      else setError("Falha no login.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div className="card" style={{ width: "min(520px, 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 800 }}>Check Insurance Risk</div>
          <span className="badge">Login</span>
        </div>
        <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
          Acede à consola para gestão e análises.
        </div>

        <div className="hr" />

        <form className="grid" onSubmit={submit}>
          <div>
            <label className="label">Username</label>
            <input className="input" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && <div className="notice" style={{ borderColor: "rgba(239,68,68,.35)", color: "#fecaca" }}>{error}</div>}

          <button className="btn primary" disabled={busy}>
            {busy ? "A autenticar..." : "Entrar"}
          </button>

          <div className="muted" style={{ fontSize: 12 }}>
            API endpoint: <span style={{ color: "#cbd5e1" }}>{apiBaseUrl()}</span>
          </div>
        </form>
      </div>
    </div>
  );
}
