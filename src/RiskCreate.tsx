import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRisk } from "./mockApi";

export default function RiskCreate() {
  const [name, setName] = useState("");
  const nav = useNavigate();

  const submit = async () => {
    if (!name.trim()) return;
    const r = await createRisk(name.trim());
    nav(`/risks/${r.id}`);
  };

  return (
    <>
      <h2>Nova Análise</h2>
      <input
        placeholder="Nome analisado"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={submit}>Criar</button>
    </>
  );
}
