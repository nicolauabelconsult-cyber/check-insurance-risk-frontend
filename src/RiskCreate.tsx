import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchCandidates, confirmAnalysis } from "./mockApi";

export default function RiskCreate() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [nationality, setNationality] = useState("");
  const [cands, setCands] = useState<any[] | null>(null);

  const [picked, setPicked] = useState<any | null>(null);
  const [idType, setIdType] = useState<"BI" | "PASSPORT">("BI");
  const [idNumber, setIdNumber] = useState("");

  const search = async () => {
    const q = name.trim();
    if (!q) return;
    const hits = await searchCandidates({ name: q, nationality: nationality.trim() || undefined });
    setCands(hits);
    setPicked(null);
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

    nav(`/risks/${r.id}`);
  };

  return (
    <>
      <h2 className="h1">Nova Análise</h2>
      <p className="sub">Pesquisa por nome e confirmação por BI/Passaporte.</p>

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
        <div className="card" style={{ padding: 16 }}>
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
              {cands.map((c) => (
                <tr key={c.id}>
                  <td>{c.full_name}</td>
                  <td>{c.nationality}</td>
                  <td>{c.doc_type ? `${c.doc_type} • ****${c.doc_last4 || ""}` : "-"}</td>
                  <td><span className="tag ok">{c.match_score}</span></td>
                  <td><button className="btn" onClick={() => setPicked(c)}>Selecionar</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          {picked && (
            <div className="card" style={{ padding: 14, marginTop: 14 }}>
              <h4 style={{ marginTop: 0 }}>Confirmar</h4>

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
