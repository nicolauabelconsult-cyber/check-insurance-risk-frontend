import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { listRisks, searchCandidates, confirmAnalysis } from "./mockApi";

export default function RiskList() {
  const nav = useNavigate();

  const [risks, setRisks] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [nationality, setNationality] = useState("");
  const [cands, setCands] = useState<any[] | null>(null);

  const [picked, setPicked] = useState<any | null>(null);
  const [idType, setIdType] = useState<"BI" | "PASSPORT">("BI");
  const [idNumber, setIdNumber] = useState("");

  const load = async () => setRisks(await listRisks());
  useEffect(() => { load(); }, []);

  const run = async () => {
    const q = name.trim();
    if (!q) return;
    const hits = await searchCandidates({ name: q, nationality: nationality.trim() || undefined });
    setCands(hits);
    setPicked(null);
    setIdNumber("");
  };

  const confirm = async () => {
    if (!picked) return;
    if (!idNumber.trim() || !nationality.trim()) return;

    const r = await confirmAnalysis({
      candidate_id: picked.id,
      name: picked.full_name,
      nationality: nationality.trim(),
      id_type: idType,
      id_number: idNumber.trim(),
    });

    await load();
    setCands(null);
    setPicked(null);
    nav(`/risks/${r.id}`);
  };

  return (
    <>
      <div className="toolbar">
        <div>
          <h2 className="h1">Análises de Risco</h2>
          <p className="sub">Pesquisa por Nome (com desambiguação) e geração de PDF técnico.</p>
        </div>
        <Link className="btn" to="/risks">Atualizar</Link>
      </div>

      <div className="toolbar" style={{ justifyContent: "flex-start" }}>
        <div style={{ width: 420 }}>
          <label>Nome</label>
          <input className="input" style={{ width: "100%" }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: João Manuel" />
        </div>

        <div style={{ width: 240 }}>
          <label>Nacionalidade (recomendado)</label>
          <input className="input" style={{ width: "100%" }} value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="Ex: Angolana" />
        </div>

        <button className="btn primary" onClick={run}>Pesquisar</button>
      </div>

      {cands && (
        <div className="card" style={{ padding: 16, marginBottom: 14 }}>
          <div className="toolbar">
            <div>
              <h3 style={{ margin: 0 }}>Possíveis correspondências</h3>
              <p className="sub" style={{ marginTop: 6 }}>
                Se houver vários nomes, selecione 1 e confirme BI/Passaporte para gerar o relatório.
              </p>
            </div>
            <button className="btn" onClick={() => setCands(null)}>Fechar</button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Nacionalidade</th>
                <th>DOB</th>
                <th>Doc</th>
                <th>Score</th>
                <th>Fontes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cands.map((c) => (
                <tr key={c.id}>
                  <td>{c.full_name}</td>
                  <td>{c.nationality}</td>
                  <td>{c.dob || "-"}</td>
                  <td>{c.doc_type ? `${c.doc_type} • ****${c.doc_last4 || ""}` : "-"}</td>
                  <td><span className="tag ok">{c.match_score}</span></td>
                  <td style={{ maxWidth: 320, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {(c.sources || []).join(", ")}
                  </td>
                  <td>
                    <button className="btn" onClick={() => setPicked(c)}>Selecionar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {picked && (
            <div className="card" style={{ padding: 14, marginTop: 14 }}>
              <h4 style={{ marginTop: 0 }}>Confirmar identidade</h4>

              <div className="toolbar" style={{ justifyContent: "flex-start" }}>
                <div style={{ width: 220 }}>
                  <label>Tipo Documento</label>
                  <select value={idType} onChange={(e) => setIdType(e.target.value as any)}>
                    <option value="BI">BI</option>
                    <option value="PASSPORT">PASSPORT</option>
                  </select>
                </div>

                <div style={{ width: 360 }}>
                  <label>Nº Documento</label>
                  <input className="input" style={{ width: "100%" }} value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="Obrigatório para gerar PDF" />
                </div>

                <div style={{ width: 240 }}>
                  <label>Nacionalidade (obrigatório)</label>
                  <input className="input" style={{ width: "100%" }} value={nationality} onChange={(e) => setNationality(e.target.value)} />
                </div>

                <button className="btn primary" onClick={confirm}>
                  Gerar análise + PDF
                </button>
              </div>

              <p className="sub">
                Selecionado: <b>{picked.full_name}</b> ({picked.nationality})
              </p>
            </div>
          )}
        </div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Ref</th>
            <th>Nome</th>
            <th>Nacionalidade</th>
            <th>Risco</th>
            <th>Score</th>
            <th>PEP</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {risks.map((r) => (
            <tr key={r.id}>
              <td>{r.ref}</td>
              <td>{r.name}</td>
              <td>{r.nationality || "-"}</td>
              <td><span className="tag warn">{r.risk_level}</span></td>
              <td>{r.score}</td>
              <td>{r.pep?.is_pep ? `Sim (${r.pep.role_or_function || "Cargo não informado"})` : "Não"}</td>
              <td>
                <Link className="btn" to={`/risks/${r.id}`}>Ver / PDF</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
