import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { createAnalysis, listAnalyses } from "../api/analyses";
import type { Analysis } from "../lib/types";
import { ApiError } from "../lib/http";

function badgeFor(level?: string | null) {
  const l = (level ?? "").toUpperCase();
  if (l === "LOW") return "badge ok";
  if (l === "MEDIUM") return "badge warn";
  if (l === "HIGH" || l === "CRITICAL") return "badge danger";
  return "badge";
}

export default function Analyses() {
  const { token } = useAuth();
  const [items, setItems] = useState<Analysis[]>([]);
  const [subject, setSubject] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Analysis | null>(null);

  const load = async () => {
    setErr(null);
    try {
      const res = await listAnalyses(token!);
      setItems(res);
    } catch (e: any) {
      if (e instanceof ApiError) setErr(`${e.status}: ${String(e.detail)}`);
      else setErr("Erro a carregar análises.");
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    setErr(null);
    setBusy(true);
    try {
      const a = await createAnalysis(token!, subject.trim());
      setItems([a, ...items]);
      setSubject("");
      setSelected(a);
    } catch (e: any) {
      if (e instanceof ApiError) setErr(`${e.status}: ${String(e.detail)}`);
      else setErr("Erro ao criar análise.");
    } finally {
      setBusy(false);
    }
  };

  const report = useMemo(() => selected, [selected]);

  const exportPdf = () => window.print();

  return (
    <div className="grid">
      <div className="card no-print">
        <div style={{ fontWeight: 800 }}>Análises</div>
        <div className="muted" style={{ marginTop: 6 }}>
          Clientes apenas veem e criam análises dentro da sua entidade.
        </div>
        <div className="hr" />
        <div className="grid two">
          <div>
            <label className="label">Nome do sujeito</label>
            <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex: João Manuel" />
          </div>
          <div style={{ display: "flex", alignItems: "end", gap: 10 }}>
            <button className="btn primary" onClick={submit} disabled={busy || !subject.trim()}>
              {busy ? "A processar..." : "Nova pesquisa"}
            </button>
            <button className="btn" onClick={load}>Recarregar</button>
          </div>
        </div>
        {err && <div className="notice" style={{ marginTop: 12, borderColor: "rgba(239,68,68,.35)", color: "#fecaca" }}>{err}</div>}
      </div>

      <div className="grid two">
        <div className="card no-print">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Histórico</div>
          {items.length === 0 ? (
            <div className="muted">Sem análises.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Pesquisa Nº</th>
                  <th>Sujeito</th>
                  <th>Risco</th>
                  <th>PEP</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => {
                  const searchNo = a.search_number ?? a.id;
                  return (
                    <tr key={a.id} style={{ cursor: "pointer" }} onClick={() => setSelected(a)}>
                      <td>{searchNo}</td>
                      <td>{a.subject_name}</td>
                      <td><span className={badgeFor(a.risk_level)}>{a.risk_level ?? "-"}</span></td>
                      <td>{a.pep === true ? "SIM" : a.pep === false ? "NÃO" : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 700 }}>Relatório técnico</div>
            <button className="btn primary no-print" onClick={exportPdf} disabled={!report}>Exportar PDF</button>
          </div>
          <div className="hr" />

          {!report ? (
            <div className="muted">Seleciona uma análise para gerar o relatório.</div>
          ) : (
            <div className="grid">
              <div className="notice">
                <div><b>Pesquisa Nº:</b> {report.search_number ?? report.id}</div>
                <div><b>Data:</b> {report.created_at ? new Date(report.created_at).toLocaleString() : "—"}</div>
              </div>

              <div className="card" style={{ padding: 12 }}>
                <div style={{ fontWeight: 700 }}>Sujeito</div>
                <div className="muted">{report.subject_name}</div>
              </div>

              <div className="grid two">
                <div className="kpi">
                  <div className="muted" style={{ fontSize: 12 }}>Risk score</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{report.risk_score ?? "—"}</div>
                </div>
                <div className="kpi">
                  <div className="muted" style={{ fontSize: 12 }}>Risk level</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>
                    <span className={badgeFor(report.risk_level)}>{report.risk_level ?? "—"}</span>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 12 }}>
                <div style={{ fontWeight: 700 }}>PEP</div>
                <div className="muted" style={{ marginTop: 6 }}>
                  {report.pep === true ? "SIM (Politically Exposed Person)" : report.pep === false ? "NÃO" : "Não informado pelo backend"}
                </div>
                <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>
                  Nota: o backend é a fonte de verdade para PEP. O frontend apenas apresenta.
                </div>
              </div>

              <div className="card" style={{ padding: 12 }}>
                <div style={{ fontWeight: 700 }}>Notas técnicas</div>
                <div className="muted" style={{ marginTop: 6 }}>
                  Este relatório é gerado para fins de auditoria interna. Clientes apenas podem visualizar análises da sua entidade.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
