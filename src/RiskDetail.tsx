import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRisk, downloadPdf } from "./mockApi";

export default function RiskDetail() {
  const { id } = useParams();
  const [risk, setRisk] = useState<any>(null);

  useEffect(() => {
    if (id) getRisk(id).then(setRisk);
  }, [id]);

  if (!risk) return <p>A carregar...</p>;

  const download = async () => {
    const blob = await downloadPdf(risk.ref);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${risk.ref}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <h2>{risk.ref}</h2>
      <p><b>Nome:</b> {risk.name}</p>
      <p><b>Score:</b> {risk.score}</p>
      <p><b>Risco:</b> {risk.risk_level}</p>
      <p>
        <b>PEP:</b>{" "}
        {risk.pep?.is_pep ? `Sim — ${risk.pep.role_or_function || "Não informado"}` : "Não"}
      </p>
      <button onClick={download}>Download PDF Técnico</button>
    </>
  );
}
