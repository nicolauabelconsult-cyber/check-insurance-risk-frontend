import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { downloadPdf, getRisk } from "./mockApi";

export default function RiskDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [risk, setRisk] = useState<any>(null);

  useEffect(() => {
    if (id) getRisk(id).then(setRisk);
  }, [id]);

  if (!risk) return <p className="sub">A carregar...</p>;

  const onDownload = async () => {
    const blob = await downloadPdf(risk.ref);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${risk.ref}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="toolbar">
        <div>
          <h2 className="h1">{risk.ref}</h2>
          <p className="sub">Resultado técnico da análise.</p>
        </div>

        <div className="stack">
          <button className="btn" onClick={() => nav("/risks")}>Voltar</button>
          <button className="btn primary" onClick={onDownload}>
            Download PDF Técnico
          </button>
        </div>
      </div>

      <table className="table">
        <tbody>
          <tr><th>Nome analisado</th><td>{risk.name}</td></tr>
          <tr><th>Nível de risco</th><td><span className="tag warn">{risk.risk_level}</span></td></tr>
          <tr><th>Score</th><td>{risk.score}</td></tr>
          <tr>
            <th>PEP</th>
            <td>
              {risk.pep?.is_pep
                ? `Sim (${risk.pep.role_or_function || "Cargo não informado"})`
                : "Não"}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
