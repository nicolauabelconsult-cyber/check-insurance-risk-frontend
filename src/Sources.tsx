import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";
import { useAuth } from "./AuthContext";

type Entity = { id: string; name: string; type: string; status: string };
type Source = {
  id: string;
  entity_id: string;
  name: string;
  category: string;
  collected_from: string;
  status: string;
};

const API = import.meta.env.VITE_API_URL;

export default function Sources() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [entities, setEntities] = useState<Entity[]>([]);
  const [entityId, setEntityId] = useState<string>("");

  const [data, setData] = useState<Source[]>([]);
  const [q, setQ] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("PEP");
  const [collectedFrom, setCollectedFrom] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const rows = await apiFetch("/sources");
    setData(rows || []);
  };

  useEffect(() => {
    (async () => {
      try {
        setErr(null);

        if (isSuperAdmin) {
          const ents = await apiFetch("/entities");
          setEntities(ents || []);
          if (ents?.length) setEntityId(ents[0].id);
        }

        await load();
      } catch (e: any) {
        setErr(e?.message || "Erro ao carregar fontes.");
      }
    })();
  }, [isSuperAdmin]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter((x) => {
      const blob = `${x.name} ${x.category} ${x.collected_from} ${x.status}`.toLowerCase();
      return blob.includes(s);
    });
  }, [data, q]);

  const uploadFile = async (sourceId: string, f: File) => {
    const token = localStorage.getItem("cir_token");
    const form = new FormData();
    form.append("file", f);

    const res = await fetch(`${API}/sources/${sourceId}/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });

    const t = await res.text();
    const out = t ? JSON.parse(t) : null;
    if (!res.ok) throw new Error(out?.detail || `Upload falhou (HTTP ${res.status})`);

    return out; // { imported, invalid, ... }
  };

  const create = async () => {
    try {
      setErr(null);
      setMsg(null);

      if (!name.trim()) return setErr("Nome da fonte é obrigatório.");
      if (!collectedFrom.trim()) return setErr("Origem (onde foi recolhida) é obrigatória.");

      // ✅ SUPER_ADMIN precisa enviar entity_id (porque muitas vezes u.entity_id é vazio)
      const payload: any = {
        name: name.trim(),
        category,
        collected_from: collectedFrom.trim(),
      };
      if (isSuperAdmin) {
        if (!entityId) return setErr("Selecione uma Entidade.");
        payload.entity_id = entityId;
      }

      const created: Source = await apiFetch("/sources", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // ✅ se tiver ficheiro, faz upload e importa para SourceRecord
      if (file) {
        const out = await uploadFile(created.id, file);
        setMsg(`Fonte criada e importada: ${out.imported} registos (inválidos: ${out.invalid}).`);
      } else {
        setMsg("Fonte criada (sem ficheiro).");
      }

      setName("");
      setCollectedFrom("");
      setFile(null);

      await load();
    } catch (e: any) {
      setErr(e?.message || "Falha ao criar fonte.");
    }
  };

  return (
    <>
      <div className="toolbar">
        <div>
          <h2 className="h1">Fontes</h2>
          <p className="sub">Gestão de fontes e importação de ficheiros (Excel).</p>
        </div>
      </div>

      {err && <div className="tag bad" style={{ marginBottom: 10 }}>{err}</div>}
      {msg && <div className="tag ok" style={{ marginBottom: 10 }}>{msg}</div>}

      {isSuperAdmin && (
        <div className="card" style={{ padding: 14, marginBottom: 12 }}>
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

      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>Criar Fonte</h3>

        <div className="toolbar" style={{ justifyContent: "flex-start", gap: 10 }}>
          <div style={{ width: 280 }}>
            <label>Nome da fonte</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div style={{ width: 180 }}>
            <label>Categoria</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="PEP">PEP</option>
              <option value="SANCTIONS">SANCTIONS</option>
              <option value="WATCHLIST">WATCHLIST</option>
              <option value="ADVERSE_MEDIA">ADVERSE_MEDIA</option>
            </select>
          </div>

          <div style={{ width: 340 }}>
            <label>Origem (onde foi recolhida)</label>
            <input className="input" value={collectedFrom} onChange={(e) => setCollectedFrom(e.target.value)} />
          </div>

          <div style={{ width: 260 }}>
            <label>Ficheiro (opcional)</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".xlsx,.xls,.csv"
            />
          </div>

          <button className="btn primary" onClick={create}>
            Guardar Fonte
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Pesquisar</h3>
        <input
          className="input"
          placeholder="Nome, categoria, origem..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 520 }}
        />

        <table className="table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Origem</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.category}</td>
                <td>{s.collected_from}</td>
                <td><span className="tag ok">{s.status}</span></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} style={{ opacity: 0.8 }}>Sem registos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
