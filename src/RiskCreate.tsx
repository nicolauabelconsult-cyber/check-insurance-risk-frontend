import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "./api";
import { useAuth } from "./AuthContext";

type Entity = { id: string; name: string; type: string; status: string };

export default function RiskCreate() {
  const nav = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  const [entities, setEntities] = useState<Entity[]>([]);
  const [entityId, setEntityId] = useState<string>("");

  const [name, setName] = useState("");
  const [nationality, setNationality] = useState("");

  const [cands, setCands] = useState<any[] | null>(null);
  const [picked, setPicked] = useState<any | null>(null);

  const [idType, setIdType] = useState<"BI" | "PASSPORT">("BI");
  const [idNumber, setIdNumber] = useState("");
  const [err, setErr] = useState<string | null>(null);

  // resolve entidade final
  const finalEntityId = useMemo(() => {
    if (!user) return "";
    if (isAdmin) return entityId;
    return user.entity?.id || "";
  }, [user, isAdmin, entityId]);

  useEffect(() => {
    if (!isAdmin) return;

    apiFetch("/entities")
      .then((rows) => {
        setEntities(rows || []);
        if (rows?.length) setEntityId(rows[0].id);
      })
      .catch((e) => setErr(e.message || "Erro ao carregar entidades"));
  }, [isAdmin]);

  const search = async () => {
    setErr(null);

    if (!finalEntityId) return setErr("Selecione uma entidade.");
    if (!name.trim()) return setErr("Informe o nome.");

    const payload: any = {
      name: name.trim(),
      nationality: nationality.trim() || undefined,
    };

    // ✅ só ADMIN envia entity_id; cliente não envia
    if (isAdmin) payload.entity_id = finalEntityId;

    const out = await apiFetch("/risks/search", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setCands(out.candidates || []);
    setPicked(null);
    setIdNumber("");
  };

  const confirm = async () => {
    setErr(null);

    if (!finalEntityId) return setErr("Entidade inválida.");
    if (!name.trim()) return setErr("Informe o nome.");

    // Documento é opcional (2º nível de validação)
    const hasDoc = !!idNumber.trim();

    const payload: any = {
      candidate_id: picked ? picked.id : "NO_MATCH",
      name: name.trim(),
      nationality: nationality.trim() || undefined,
    };

    if (hasDoc) {
      payload.id_type = idType;
      payload.id_number = idNumber.trim();
    }

    // ✅ só ADMIN envia entity_id; cliente não envia
    if (isAdmin) payload.entity_id = finalEntityId;

    const r = await apiFetch("/risks/confirm", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    nav(`/risks/${r.id}`);
  };

  return (
    <>
      <h2 className="h1">Nova Análise</h2>
      <p className="sub">Pesquisa por nome e confirmação por BI/Passaporte.</p>

      {err && <div className="tag bad" style={{ marginBottom: 12 }}>{err}</div>}

      {isAdmin && (
        <div className="card" style={{ padding: 14, marginBottom: 12, maxWidth: 760 }}>
          <label>Entidade</label>
          <select className="input" value={entityId} onChange={(e) => setEntityId(e.target.value)}>
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.type})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="toolbar" style={{ justifyContent: "flex-start" }}>
        <div style={{ width: 420 }}>
          <label>Nome</label>
          <input className="input" style={{ width: "100%" }} value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div style={{ width: 240 }}>
          <label>Nacionalidade</label>
          <input className="input" style={{ width: "100%" }} value={nationality} onChange={(e) => setNationality(e.target.value)} />
        </div>

        <button className="btn primary" onClick={search}>Pesquisar</button>
      </div>

      {cands && (
        <div className="card" style={{ padding: 16, marginTop: 14 }}>
          <h3 style={{ marginTop: 0 }}>Correspondências</h3>

          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Nacionalidade</th>
                <th>Doc</th>
                <th>Score</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cands.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ opacity: 0.8 }}>Sem correspondências.</td>
                </tr>
              ) : (
                cands.map((c) => (
                  <tr key={c.id}>
                    <td>{c.full_name}</td>
                    <td>{c.nationality}</td>
                    <td>{c.doc_type ? `${c.doc_type} • ****${c.doc_last4 || ""}` : "-"}</td>
                    <td><span className="tag ok">{c.match_score}</span></td>
                    <td><button className="btn" onClick={() => setPicked(c)}>Selecionar</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Confirmação: com candidato OU sem correspondência */}
          {(picked || cands.length === 0) && (
            <div className="card" style={{ padding: 14, marginTop: 14 }}>
              <h4 style={{ marginTop: 0 }}>
                {picked ? "Confirmar candidato" : "Confirmar sem correspondência"}
              </h4>

              {!picked && (
                <div className="sub" style={{ marginBottom: 10, opacity: 0.9 }}>
                  Não foram encontradas correspondências. Pode gerar um relatório completo indicando <b>Sem correspondência</b>.
                </div>
              )}

              <div className="toolbar" style={{ justifyContent: "flex-start" }}>
                <div style={{ width: 220 }}>
                  <label>Tipo Documento (opcional)</label>
                  <select value={idType} onChange={(e) => setIdType(e.target.value as any)}>
                    <option value="BI">BI</option>
                    <option value="PASSPORT">PASSPORT</option>
                  </select>
                </div>

                <div style={{ width: 360 }}>
                  <label>Nº Documento (opcional)</label>
                  <input className="input" style={{ width: "100%" }} value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
                </div>

                <button className="btn primary" onClick={confirm}>Gerar análise + PDF</button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
