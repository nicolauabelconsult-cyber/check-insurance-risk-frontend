import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("nicolau@checkinsurancerisk.com");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr(null);
    setLoading(true);
    try {
      const ok = await login(email.trim(), password);
      if (!ok) {
        setErr("Credenciais inválidas.");
        return;
      }
      nav("/risks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2 className="h1">Acesso</h2>
      <p className="sub">Introduza as suas credenciais.</p>

      <div className="toolbar" style={{ justifyContent: "flex-start" }}>
        <div style={{ width: "100%" }}>
          <label>Email</label>
          <input
            className="input"
            style={{ width: "100%" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@empresa.com"
            autoComplete="username"
          />
        </div>

        <div style={{ width: "100%" }}>
          <label>Password</label>
          <input
            className="input"
            style={{ width: "100%" }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            autoComplete="current-password"
          />
        </div>

        {err && (
          <div className="tag bad" style={{ width: "100%" }}>
            {err}
          </div>
        )}

        <button className="btn primary" onClick={submit} disabled={loading}>
          {loading ? "A entrar..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}
