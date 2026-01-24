import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRisk } from "./mockApi";

export default function RiskCreate() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (!name.trim()) {
      setErr("Informe o nome a analisar.");
      return;
    }
    const r = await createRisk(name.trim());
    nav(`/risks/${r.id}`);
  };

  return (
    <>
      <h2 className="h1">Nova Análise</h2>
      <p className="sub">Criar uma pesquisa de risco com número sequencial.</p>

      <div className="toolbar" style={{ justifyContent: "flex-start" }}>
        <div style={{ width: 420 }}>
          <label>Nome / Entidade</label>
          <input
            className="input"
            style={{ width: "100%" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João Manuel / Empresa X"
          />
        </div>

        <button className="btn primary" onClick={submit}>
          Criar análise
        </button>

        {err && <span className="tag bad">{err}</span>}
      </div>
    </>
  );
}
