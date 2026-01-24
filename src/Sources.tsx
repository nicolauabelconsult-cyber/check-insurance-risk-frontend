import { useEffect, useMemo, useState } from "react";
import { createSourceMeta, deleteSource, listSources, updateSource, uploadSource } from "./mockApi";

export default function Sources() {
  const [data, setData] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("ALL");

  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => setData(await listSources());

  useEffect(() => { load(); }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    data.forEach((s) => set.add(s.category || "UNCATEGORIZED"));
    return ["ALL", ...Array.from(set)];
  }, [data]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.filter((x) => {
      const blob = `${x.name} ${x.type} ${x.status} ${x.category || ""} ${(x.tags || []).join(",")}`.toLowerCase();
      const okQ = !s ? true : blob.includes(s);
      const okCat = category === "ALL" ? true : (x.category || "UNCATEGORIZED") === category;
      return okQ && okCat;
    });
  }, [data, q, category]);

  const submitUpload = async () => {
    if (!file) return;
    const created = await uploadSource(file);
    // depois do upload, abre modal simples para classificar
    setEditing({ ...created, tagsText: (created.tags || []).join(", ") });
    setFile(null);
    await load();
  };

  const saveEdit = async () => {
    if (!editing) return;
    const tags = String(editing.tagsText || "")
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);

    await updateSource(editing.id, {
      category: editing.category || "UNCATEGORIZED",
      tags,
      status: editing.status || "READY",
    });

    setEditing(null);
    await load();
  };

  const remove = async (id: string) => {
    const ok = confirm("Eliminar esta fonte? Esta ação será registada na auditoria.");
    if (!ok) return;
    await deleteSource(id);
    await load();
  };

  return (
    <>
      <div className="toolbar">
        <div>
          <h2 className="h1">Fontes</h2>
          <p className="sub">Upload, classificação e gestão para suportar as pesquisas.</p>
        </div>
      </div>

      <div className="toolbar" style={{ justifyContent: "flex-start" }}>
        <input type="file" accept=".csv,.xlsx,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button className="btn primary" onClick={submitUpload} disabled={!file}>Enviar</button>

        <div style={{ width: 360 }}>
          <label>Pesquisar</label>
          <input className="input" style={{ width: "100%" }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome, categoria, tags..." />
        </div>

        <div style={{ width: 220 }}>
          <label>Categoria</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Categoria</th>
            <th>Tags</th>
            <th>Upload por</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td><span className="tag">{s.type}</span></td>
              <td><span className={`tag ${s.status === "READY" ? "ok" : "warn"}`}>{s.status}</span></td>
              <td><span className="tag">{s.category || "UNCATEGORIZED"}</span></td>
              <td style={{ maxWidth: 240, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {(s.tags || []).join(", ") || "-"}
              </td>
              <td>{s.uploaded_by?.name}</td>
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
            <div style={{ width: 260 }}>
              <label>Categoria</label>
              <select value={editing.category || "UNCATEGORIZED"} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                <option value="UNCATEGORIZED">UNCATEGORIZED</option>
                <option value="PEP">PEP</option>
                <option value="SANCTIONS">SANCTIONS</option>
                <option value="INTERNAL">INTERNAL</option>
                <option value="NEWS">NEWS</option>
              </select>
            </div>

            <div style={{ width: 260 }}>
              <label>Estado</label>
              <select value={editing.status || "READY"} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                <option value="READY">READY</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div style={{ width: 520 }}>
              <label>Tags (separar por vírgula)</label>
              <input
                className="input"
                style={{ width: "100%" }}
                value={editing.tagsText || ""}
                onChange={(e) => setEditing({ ...editing, tagsText: e.target.value })}
                placeholder="Ex: Angola, Governo, 2026"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
