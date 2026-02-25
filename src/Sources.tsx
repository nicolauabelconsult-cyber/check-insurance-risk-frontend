import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";
import { useAuth } from "./AuthContext";

type Entity = { id: string; name: string; sector?: string };

type SourceRow = {
  id: string;
  name: string;
  category: string;
  collected_from: string; // <-- backend field
  source_location?: string | null;
  tags?: string[] | null;
  file_name?: string | null;
  status: string;
  created_at: string;
};

function stringifyErr(e: any) {
  if (!e) return "Erro desconhecido";
  if (typeof e === "string") return e;
  if (typeof e?.message === "string") return e.message;
  if (typeof e?.detail === "string") return e.detail;
  if (Array.isArray(e?.detail)) {
    try {
      // FastAPI validation errors
      return e.detail.map((x: any) => `${(x.loc || []).join(".")}: ${x.msg}`).join(" | ");
    } catch {
      /* ignore */
    }
  }
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

export default function Sources() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [entities, setEntities] = useState<Entity[]>([]);
  const [entityId, setEntityId] = useState<string>("");

  const [data, setData] = useState<SourceRow[]>([]);
  const [q, setQ] = useState("");

  // form create
  const [name, setName] = useState("");
  const [category, setCategory] = useState("PEP");
  const [collectedFrom, setCollectedFrom] = useState("");
  const [location, setLocation] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // edit modal
  const [editing, setEditing] = useState<any | null>(null);

  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadEntities = async () => {
    if (!isSuperAdmin) return;
    try {
      const rows = await apiFetch("/entities");
      const list: Entity[] = rows || [];
      setEntities(list);
      if (!entityId && list.length > 0) setEntityId(list[0].id);
    } catch (e: any) {
      setErr(stringifyErr(e));
    }
  };

  const loadSources = async () => {
    setErr(null);
    try {
      let url = "/sources";
      if (isSuperAdmin) {
        if (!entityId) {
          setData([]);
          return;
        }
        url = `/sources?entity_id=${encodeURIComponent(entityId)}`;
      }
      const rows = await apiFetch(url);
      setData(rows || []);
    } catch (e: any) {
      setErr(stringifyErr(e));
    }
  };

  useEffect(() => {
    loadEntities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter((x) => {
      const blob = `${x.name} ${x.category} ${x.collected_from} ${(x.tags || []).join(",")} ${x.file_name || ""}`.toLowerCase();
      return blob.includes(s);
    });
  }, [data, q]);

  const create = async () => {
    setErr(null);

    if (!name.trim() || !collectedFrom.trim()) return;
    if (isSuperAdmin && !entityId) {
      setErr("Selecione uma Entidade antes de criar a fonte.");
      return;
    }

    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setBusy(true);
    try {
      // 1) create metadata
      const payload: any = {
        name: name.trim(),
        category,
        collected_from: collectedFrom.trim(), // <-- REQUIRED by backend
        source_location: location.trim() || undefined,
        tags,
      };
      if (isSuperAdmin) payload.entity_id = entityId;

      const created = await apiFetch("/sources", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // 2) upload file if present
      if (file) {
        const form = new FormData();
        form.append("file", file);

        const token = localStorage.getItem("cir_token");
        const headers: Record<string, string> = {};
        if (token && token !== "null" && token !== "undefined") {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const API = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API}/sources/${created.id}/upload`, {
          method: "POST",
          headers,
          body: form,
        });

        const text = await res.text();
        const out = text ? JSON.parse(text) : null;
        if (!res.ok) throw new Error(out?.detail || `Upload falhou (HTTP ${res.status})`);
      }

      // reset form
      setName("");
      setCollectedFrom("");
      setLocation("");
      setTagsText("");
      setFile(null);

      await loadSources();
    } catch (e: any) {
      setErr(stringifyErr(e));
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async () => {
    setErr(null);
    if (!editing) return;

    if (isSuperAdmin && !entityId) {
      setErr("Selecione uma Entidade antes de editar.");
      return;
    }

    setBusy(true);
    try {
      const tags = String(editing.tagsText || "")
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);

      const payload: any = {
        name: editing.name,
        category: editing.category,
        collected_from: editing.collected_from, // <-- REQUIRED by backend
        source_location: editing.source_location || undefined,
        tags,
        status: editing.status,
      };
      if (isSuperAdmin) payload.entity_id = entityId;

      await apiFetch(`/sources/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      setEditing(null);
      await loadSources();
    } catch (e: any) {
      setErr(stringifyErr(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    setErr(null);
    if (!confirm("Eliminar esta fonte?")) return;

    if (isSuperAdmin && !entityId) {
      setErr("Selecione uma Entidade antes de eliminar.");
      return;
    }

    setBusy(true);
    try {
      const url = isSuperAdmin ? `/sources/${id}?entity_id=${encodeURIComponent(entityId)}` : `/sources/${id}`;
      await apiFetch(url, { method: "DELETE" });
      await loadSources();
    } catch (e: any) {
      setErr(stringifyErr(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="toolbar">
        <div>
          <h2 className="h1">Fontes</h2>
          <p className="sub">Criar e classificar fontes com origem para suportar pesquisas.</p>
        </div>
      </div>

      {err && (
        <div className="tag bad" style={{ marginBottom: 12 }}>
          {err}
        </div>
      )}

      {isSuperAdmin && (
        <div className="card" style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ marginTop: 0 }}>Entidade</h3>
          <div className="toolbar" style={{ justifyContent: "flex-start" }}>
            <div style={{ width: 520 }}>
              <label>Selecionar Entidade (obrigatório)</label>
              <select value={entityId} onChange={(e) => setEntityId(e.target.value)} style={{ width: "100%" }}>
                {entities.map((en) => (
                  <option key={en.id} value={en.id}>
                    {en.name} {en.sector ? `(${en.sector})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn" onClick={loadEntities} disabled={busy}>
              Recarregar entidades
            </button>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 16, marginBottom: 14 }}>
        <h3 style={{ marginTop: 0 }}>Criar Fonte</h3>

        <div className="toolbar" style={{ justifyContent: "flex-start" }}>
          <div style={{ width: 280 }}>
            <label>Nome da fonte</label>
            <input
              className="input"
              style={{ width: "100%" }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: PEP Angola 2026"
            />
          </div>

          <div style={{ width: 220 }}>
            <label>Categoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="PEP">PEP</option>
              <option value="SANCTIONS">SANCTIONS</option>
              <option value="WATCHLIST">WATCHLIST</option>
              <option value="ADVERSE_MEDIA">ADVERSE_MEDIA</option>
              <option value="INSURANCE">INSURANCE</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div style={{ width: 520 }}>
            <label>Origem (onde foi recolhida)</label>
            <input
              className="input"
              style={{ width: "100%" }}
              value={collectedFrom}
              onChange={(e) => setCollectedFrom(e.target.value)}
              placeholder="Ex: Website oficial / órgão / fornecedor / jornal"
            />
          </div>

          <div style={{ width: 220 }}>
            <label>Local (opcional)</label>
            <input
              className="input"
              style={{ width: "100%" }}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Luanda"
            />
          </div>

          <div style={{ width: 520 }}>
            <label>Tags (vírgulas)</label>
            <input
              className="input"
              style={{ width: "100%" }}
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="Ex: Angola, Governo, 2026"
            />
          </div>

          <div style={{ width: 320 }}>
            <label>Ficheiro (opcional)</label>
            <input type="file" accept=".csv,.xlsx,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          <button
            className="btn primary"
            onClick={create}
            disabled={busy || !name.trim() || !collectedFrom.trim() || (isSuperAdmin && !entityId)}
          >
            {busy ? "A processar..." : "Guardar Fonte"}
          </button>
        </div>
      </div>

      <div className="toolbar" style={{ justifyContent: "flex-start" }}>
        <div style={{ width: 420 }}>
          <label>Pesquisar</label>
          <input
            className="input"
            style={{ width: "100%" }}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nome, categoria, origem, tags..."
          />
        </div>
        <button className="btn" onClick={loadSources} disabled={busy}>
          Atualizar
        </button>
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
              <td>
                <span className="tag">{s.category}</span>
              </td>
              <td style={{ maxWidth: 320, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {s.collected_from}
              </td>
              <td style={{ maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {(s.tags || []).join(", ") || "-"}
              </td>
              <td>{s.file_name || "-"}</td>
              <td>
                <span className={`tag ${s.status === "READY" ? "ok" : "warn"}`}>{s.status}</span>
              </td>
              <td>{new Date(s.created_at).toLocaleString()}</td>
              <td className="stack">
                {isSuperAdmin && (
                  <>
                    <button
                      className="btn"
                      onClick={() =>
                        setEditing({
                          ...s,
                          tagsText: (s.tags || []).join(", "),
                        })
                      }
                    >
                      Editar
                    </button>
                    <button className="btn danger" onClick={() => remove(s.id)} disabled={busy}>
                      Eliminar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && isSuperAdmin && (
        <div className="card" style={{ padding: 16, marginTop: 14 }}>
          <div className="toolbar">
            <div>
              <h3 style={{ margin: 0 }}>Editar Fonte</h3>
              <p className="sub" style={{ marginTop: 6 }}>{editing.name}</p>
            </div>
            <div className="stack">
              <button className="btn" onClick={() => setEditing(null)} disabled={busy}>
                Fechar
              </button>
              <button className="btn primary" onClick={saveEdit} disabled={busy || (isSuperAdmin && !entityId)}>
                {busy ? "A processar..." : "Guardar"}
              </button>
            </div>
          </div>

          <div className="toolbar" style={{ justifyContent: "flex-start" }}>
            <div style={{ width: 320 }}>
              <label>Nome</label>
              <input
                className="input"
                style={{ width: "100%" }}
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>

            <div style={{ width: 220 }}>
              <label>Categoria</label>
              <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                <option value="PEP">PEP</option>
                <option value="SANCTIONS">SANCTIONS</option>
                <option value="WATCHLIST">WATCHLIST</option>
                <option value="ADVERSE_MEDIA">ADVERSE_MEDIA</option>
                <option value="INSURANCE">INSURANCE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div style={{ width: 520 }}>
              <label>Origem (onde foi recolhida)</label>
              <input
                className="input"
                style={{ width: "100%" }}
                value={editing.collected_from}
                onChange={(e) => setEditing({ ...editing, collected_from: e.target.value })}
              />
            </div>

            <div style={{ width: 240 }}>
              <label>Local</label>
              <input
                className="input"
                style={{ width: "100%" }}
                value={editing.source_location || ""}
                onChange={(e) => setEditing({ ...editing, source_location: e.target.value })}
              />
            </div>

            <div style={{ width: 520 }}>
              <label>Tags</label>
              <input
                className="input"
                style={{ width: "100%" }}
                value={editing.tagsText || ""}
                onChange={(e) => setEditing({ ...editing, tagsText: e.target.value })}
              />
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
