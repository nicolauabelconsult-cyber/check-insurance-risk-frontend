// RiskCreate.tsx (versão backend)
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "./api";

export default function RiskCreate() {
  const nav = useNavigate();

  const [entityId, setEntityId] = useState("");
  const [name, setName] = useState("");
  const [nationality, setNationality] = useState("");
  const [bi, setBi] = useState("");
  const [passport, setPassport] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);

    try {
      const body: any = {
        entity_id: entityId.trim(),
        name: name.trim(),
        nationality: nationality.trim(),
      };

      if (bi.trim()) body.bi = bi.trim();
      if (passport.trim()) body.passport = passport.trim();

      const r = await apiFetch("/risks", {
        method: "POST",
        body: JSON.stringify(body),
      });

      nav(`/risks/${r.id}`);
    } catch (e: any) {
      setErr(e.message || "Erro ao criar análise.");
    }
  };

  return (
    <>
      <h2 className="h1">Nova Análise</h2>
      <p className="sub">Cria uma análise no backend.</p>

      <div className="card" style={{ padding: 16, maxWidth: 640 }}>
        <label>Entity ID (obrigatório)</label>
        <input className="input" value={entityId} onChange={(e) => setEntityId(e.target.value)} />

        <label style={{ marginTop: 10 }}>Nome</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />

        <label style={{ marginTop: 10 }}>Nacionalidade</label>
        <input className="input" value={nationality} onChange={(e) => setNationality(e.target.value)} />

        <label style={{ marginTop: 10 }}>BI</label>
        <input className="input" value={bi} onChange={(e) => setBi(e.target.value)} />

        <label style={{ marginTop: 10 }}>Passaporte</label>
        <input className="input" value={passport} onChange={(e) => setPassport(e.target.value)} />

        {err && <div className="tag bad" style={{ marginTop: 12 }}>{err}</div>}

        <button className="btn primary" style={{ marginTop: 12 }} onClick={submit}>
          Criar Análise
        </button>
      </div>
    </>
  );
}
