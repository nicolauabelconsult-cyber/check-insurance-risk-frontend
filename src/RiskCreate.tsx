// src/RiskCreate.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { risksApi } from "./services/risks";
import { useAuth } from "./AuthContext";
import { entitiesApi } from "./services/entities"; // vais criar / confirmar se já existe

type Candidate = {
  id: string;
  full_name: string;
  nationality?: string;
  dob?: string;
  doc_type?: string;
  doc_last4?: string;
  sources: string[];
  match_score: number;
};

export default function RiskCreate() {
  const nav = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  const [entityId, setEntityId] = useState<string>("");
  const [entities, setEntities] = useState<Array<{ id: string; name: string }>>([]);

  const [name, setName] = useState("");
  const [nationality, setNationality] = useState("");

  const [step, setStep] = useState<"form" | "pick" | "confirming">("form");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [picked, setPicked] = useState<Candidate | null>(null);

  const [idType, setIdType] = useState<"BI" | "PASSPORT">("BI");
  const [idNumber, setIdNumber] = useState("");

  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    entitiesApi
      .list()
      .then((rows: any[]) => {
        const clean = rows.map((e) => ({ id: e.id, name: e.name }));
        setEntities(clean);
        if (!entityId && clean.length) setEntityId(clean[0].id);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  async function doSearch() {
    setErr(null);
    setPicked(null);
    setCandidates([]);

    if (!name.trim()) {
      setErr("Nome é obrigatório.");
      return;
    }
    if (isAdmin && !entityId) {
      setErr("Entity é obrigatória para ADMIN/SUPER_ADMIN.");
      return;
    }

    try {
      const payload: any = { name: name.trim(), nationality: nationality.trim() || undefined };
      if (isAdmin) payload.entity_id = entityId;

      const out = await risksApi.search(payload);
      const hits = (out?.candidates || []) as Candidate[];

      if (!hits.length) {
        setErr("Sem resultados.");
        return;
      }

      setCandidates(hits);
      setStep(hits.length > 1 ? "pick" : "confirming");
      setPicked(hits.length === 1 ? hits[0] : null);

      if (hits.length === 1) {
        // auto-confirm se só tiver 1 candidato (pedimos doc na mesma)
        setStep("pick");
        setPicked(hits[0]);
      }
    } catch (e: any) {
      setErr(e.message || "Erro no search.");
    }
  }

  async function doConfirm() {
    setErr(null);
    if (!picked) return setErr("Escolha um candidato.");
    if (!idNumber.trim()) return setErr("Introduza o BI/PASSAPORTE.");

    try {
      setStep("confirming");
      const payload: any = {
        candidate_id: picked.id,
        name: name.trim(),
        nationality: (picked.nationality || nationality || "").trim(),
        id_type: idType,
        id_number: idNumber.trim(),
      };
      if (isAdmin) payload.entity_id = entityId;

      const r = await risksApi.confirm(payload);
      nav(`/risks/${r.id}`);
    } catch (e: any) {
      setStep("pick");
      setErr(e.message || "Erro ao confirmar.");
    }
  }

  return (
    <>
      <h2 className="h1">Nova Análise</h2>
      <p className="sub">Pesquisa + confirmação (backend). Sem atalhos.</p>

      <div className="card" style={{ padding: 16, maxWidth: 720 }}>
        {isAdmin && (
          <>
            <label>Entidade</label>
            <select className="input" value={entityId} onChange={(e) => setEntityId(e.target.value)}>
              {entities.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </>
        )}

        <label style={{ marginTop: 10 }}>Nome</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />

        <label style={{ marginTop: 10 }}>Nacionalidade (opcional)</label>
        <input className="input" value={nationality} onChange={(e) => setNationality(e.target.value)} />

        <button className="btn primary" style={{ marginTop: 12 }} onClick={doSearch}>
          Pesquisar
        </button>

        {err && <div className="tag bad" style={{ marginTop: 12 }}>{err}</div>}

        {candidates.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <h3 className="h2" style={{ marginBottom: 10 }}>Candidatos</h3>

            <div style={{ display: "grid", gap: 10 }}>
              {candidates.map((c) => (
                <div
                  key={c.id}
                  className="card"
                  style={{
                    padding: 12,
                    border: picked?.id === c.id ? "1px solid rgba(255,255,255,0.5)" : "1px solid rgba(255,255,255,0.12)",
                    cursor: "pointer",
                  }}
                  onClick={() => setPicked(c)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>{c.full_name}</strong>
                    <span className="tag">{c.match_score}%</span>
                  </div>
                  <div className="sub" style={{ marginTop: 6 }}>
                    {c.nationality || "-"} • {c.doc_type || "-"} • {c.doc_last4 ? `***${c.doc_last4}` : "-"}
                  </div>
                  <div className="sub" style={{ marginTop: 6 }}>
                    Fontes: {(c.sources || []).join(", ") || "-"}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              <label>Tipo Documento</label>
              <select className="input" value={idType} onChange={(e) => setIdType(e.target.value as any)}>
                <option value="BI">BI</option>
                <option value="PASSPORT">PASSPORT</option>
              </select>

              <label style={{ marginTop: 10 }}>Número Documento</label>
              <input className="input" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />

              <button className="btn primary" style={{ marginTop: 12 }} onClick={doConfirm} disabled={step === "confirming"}>
                Confirmar e Gerar Análise
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
