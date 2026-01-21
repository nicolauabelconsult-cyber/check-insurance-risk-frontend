import React from "react";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { me } = useAuth();
  return (
    <div className="grid">
      <div className="card">
        <div style={{ fontWeight: 800, fontSize: 18 }}>Bem-vindo</div>
        <div className="muted" style={{ marginTop: 6 }}>
          Estás autenticado como <b>{me?.username}</b> ({me?.role}).
        </div>
        <div className="hr" />
        <div className="notice">
          Regras RBAC (resumo):
          <ul style={{ margin: "10px 0 0 18px" }}>
            <li><b>SUPER_ADMIN</b>: cria entidades, admins, fontes, vê tudo.</li>
            <li><b>PLATFORM_ADMIN</b>: cria utilizadores e fontes (se autorizado), suporta operações.</li>
            <li><b>CLIENT_ADMIN / CLIENT_ANALYST</b>: apenas análises e relatórios da sua entidade.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
