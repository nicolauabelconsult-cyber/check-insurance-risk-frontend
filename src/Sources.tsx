import { useEffect, useMemo, useState } from "react";
import { createSource, deleteSource, listSources, updateSource } from "./mockApi";

export default function Sources() {
  const [data, setData] = useState<any[]>([]);
  const [q, setQ] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("PEP");
  const [origin, setOrigin] = useState("");
  const [location, setLocation] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => setData(await listSources());
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter((x) => {
      const blob = `${x.name} ${x.category} ${x.origin} ${(x.tags || []).join(",")} ${x.file_name || ""}`.toLowerCase();
      return blob.includes(s);
    });
  }, [data, q]);

  const create = async () => {
    const tags = tagsText.split(",").map((t) => t.trim()).filter(Boolean);
    if (!name.trim() || !origin.trim()) return;

    await createSource({
      name: name.trim(),
      category,
      origin: origin.trim(),
      source_location: location.trim(),
      tags,
      file,
    });

    setName(""); setOrigin(""); setLocation(""); setTagsText(""); setFile(null);
    await load();
  };

  const saveEdit = async () => {
    const tags = String(editing.tagsText || "").split(",").map((t: string) => t.trim()).filter(Boolean);
    await updateSource(editing.id, {
      name: editing.name,
      category: editing.category,
      origin: editing.origin,
      source_location: editing.source_location,
      tags,
      status: editing.status,
    });
    setEditing(null);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminar esta fonte?")) return;
    await deleteSource(id);
    await load();
  };

  return (
    <>
      <div className="toolbar">
        <div>
          <h2 className="h1">Fontes</h2>
          <p className="sub">Criar e classificar fontes com origem (onde foi recolhida) para suportar pesquisas.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 14 }}>
        <h3 style={{ marginTop: 0 }}>Criar Fonte</h3>

        <div className="toolbar" style={{ justifyContent: "flex-start" }}>
          <div style={{ width: 260 }}>
            <label>Nome da fonte</label>
            <input className="input" style={{ width: "100%" }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: PEP Angola 2026" />
          </div>

          <div style={{ width: 220 }}>
            <label>Categoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="PEP">PEP</option>
              <option value="SANCTIONS">SANCTIONS</option>
              <option value="INTERNAL">INTERNAL</option>
              <option value="NEWS">NEWS</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div style={{ width: 420 }}>
            <label>Origem (onde foi recolhida)</label>
            <input className="input" style={{ width: "100%" }} value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Ex: Website oficial / órgão / fornecedor / jornal" />
          </div>

          <div style={{ width: 220 }}>
            <label>Local (opcional)</label>
            <input className="input" style={{ width: "100%" }} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: Luanda" />
          </div>

          <div style={{ width: 420 }}>
            <label>Tags (vírgulas)</label>
            <input className="input" style={{ width: "100%" }} value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="Ex: Angola, Governo, 2026" />
          </div>

          <div style={{ width: 320 }}>
            <label>Ficheiro (opcional)</label>
            <input type="file" accept=".csv,.xlsx,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          <button className="btn primary" onClick={create} disabled={!name.trim() || !origin.trim()}>
            Guardar Fonte
          </button>
        </div>
      </div>

      <div className="toolbar" style={{ justifyContent: "flex-start" }}>
        <div style={{ width: 420 }}>
          <label>Pesquisar</label>
          <input className="input" style={{ width: "100%" }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome, categoria, origem, tags..." />
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Origem</th>
            <th>Tags</th>
            <th>Ficheiro</th>
            <th>Estado</th>
            <th>Data</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td><span className="tag">{s.category}</span></td>
              <td style={{ maxWidth: 320, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.origin}</td>
              <td style={{ maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{(s.tags || []).join(", ") || "-"}</td>
              <td>{s.file_name || "-"}</td>
              <td><span className={`tag ${s.status === "READY" ? "ok" : "warn"}`}>{s.status}</span></td>
              <td>{new Date(s.created_at).toLocaleString()}</td>
              <td className="stack">
                <button className="btn" onClick={() => setEditing({ ...s, tagsText: (s.tags || []).join(", ") })}>Editar</button>
                <button className="btn danger" onClick={() => remove(s.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <div className="card" style={{ padding: 16, marginTop: 14 }}>
          <div className="toolbar">
            <div>
              <h3 style={{ margin: 0 }}>Editar Fonte</h3>
              <p className="sub" style={{ marginTop: 6 }}>{editing.name}</p>
            </div>
            <div className="stack">
              <button className="btn" onClick={() => setEditing(null)}>Fechar</button>
              <button className="btn primary" onClick={saveEdit}>Guardar</button>
            </div>
          </div>

          <div className="toolbar" style={{ justifyContent: "flex-start" }}>
            <div style={{ width: 320 }}>
              <label>Nome</label>
              <input className="input" style={{ width: "100%" }} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>

            <div style={{ width: 220 }}>
              <label>Categoria</label>
              <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                <option value="PEP">PEP</option>
                <option value="SANCTIONS">SANCTIONS</option>
                <option value="INTERNAL">INTERNAL</option>
                <option value="NEWS">NEWS</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div style={{ width: 520 }}>
              <label>Origem</label>
              <input className="input" style={{ width: "100%" }} value={editing.origin} onChange={(e) => setEditing({ ...editing, origin: e.target.value })} />
            </div>

            <div style={{ width: 240 }}>
              <label>Local</label>
              <input className="input" style={{ width: "100%" }} value={editing.source_location || ""} onChange={(e) => setEditing({ ...editing, source_location: e.target.value })} />
            </div>

            <div style={{ width: 520 }}>
              <label>Tags</label>
              <input className="input" style={{ width: "100%" }} value={editing.tagsText || ""} onChange={(e) => setEditing({ ...editing, tagsText: e.target.value })} />
            </div>

            <div style={{ width: 220 }}>
              <label>Estado</label>
              <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                <option value="READY">READY</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
