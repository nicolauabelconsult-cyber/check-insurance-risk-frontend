import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "./api";

export default function RiskDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [risk, setRisk] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setErr(null);
    apiFetch(`/risks/${id}`, { method: "GET" })
      .then(setRisk)
      .catch((e: any) => setErr(e.message || "Erro ao carregar risco."));
  }, [id]);

  if (err) return <div className="tag bad">{err}</div>;
  if (!risk) return <p className="sub">A carregar...</p>;

  return (
    <>
      <div className="toolbar">
        <div>
          <h2 className="h1">Detalhe da Análise</h2>
          <p className="sub">Dados carregados do backend.</p>
        </div>
        <button className="btn" onClick={() => nav("/risks")}>Voltar</button>
      </div>

      <table className="table">
        <tbody>
          <tr><th>Nome</th><td>{risk.name || "-"}</td></tr>
          <tr><th>Nacionalidade</th><td>{risk.nationality || "-"}</td></tr>
          <tr><th>BI</th><td>{risk.bi || "-"}</td></tr>
          <tr><th>Passaporte</th><td>{risk.passport || "-"}</td></tr>
          <tr><th>Score</th><td>{risk.score || "-"}</td></tr>
          <tr><th>Status</th><td>{risk.status || "-"}</td></tr>
          <tr><th>Resumo</th><td>{risk.summary || "-"}</td></tr>
        </tbody>
      </table>
    </>
  );
}
