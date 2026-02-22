import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "./api";

const API = import.meta.env.VITE_API_URL;

export default function RiskDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [risk, setRisk] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  const downloadPdf = async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem("cir_token");
      const res = await fetch(`${API}/risks/${id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `risk-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setErr(e?.message || "Falha ao baixar PDF.");
    }
  };

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
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={downloadPdf}>PDF</button>
          <button className="btn" onClick={() => nav("/risks")}>Voltar</button>
        </div>
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
