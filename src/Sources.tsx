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

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
      onMouseDown={onClose}
    >
      <div
        className="card"
        style={{
          width: "min(720px, 100%)",
          padding: 18,
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="toolbar" style={{ marginBottom: 8 }}>
          <div>
            <h3 style={{ margin: 0 }}>{title}</h3>
            <p className="sub" style={{ marginTop: 4 }}>
              Atualize os campos e guarde.
            </p>
          </div>
          <button className="btn" onClick={onClose}>
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

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

  // modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<Source | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("PEP");
  const [editCollectedFrom, setEditCollectedFrom] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");

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
        setMsg(null);

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

      const payload: any = {
        name: name.trim(),
        category,
        collected_from: collectedFrom.trim(),
      };

      // SUPER_ADMIN deve enviar entity_id para garantir persistência no tenant correto
      if (isSuperAdmin) {
        if (!entityId) return setErr("Selecione uma Entidade.");
        payload.entity_id = entityId;
      }

      const created: Source = await apiFetch("/sources", {
        method: "POST",
        body: JSON.stringify(payload),
      });

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

  const openEdit = (row: Source) => {
    setEditRow(row);
    setEditName(row.name);
    setEditCategory(row.category || "PEP");
    setEditCollectedFrom(row.collected_from || "");
    setEditStatus(row.status || "ACTIVE");
    setEditOpen(true);
  };

  const saveEdit = async () => {
    try {
      if (!editRow) return;
      setErr(null);
      setMsg(null);

      if (!editName.trim()) return setErr("Nome é obrigatório.");
      if (!editCollectedFrom.trim()) return setErr("Origem é obrigatória.");

      const payload = {
        name: editName.trim(),
        category: editCategory,
        collected_from: editCollectedFrom.trim(),
        status: editStatus,
      };

      await apiFetch(`/sources/${editRow.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setEditOpen(false);
      setEditRow(null);
      setMsg("Fonte atualizada com sucesso.");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Falha ao atualizar fonte.");
    }
  };

  const removeSource = async (row: Source) => {
    try {
      const ok = confirm(`Eliminar a fonte "${row.name}"?`);
      if (!ok) return;
      setErr(null);
      setMsg(null);

      await apiFetch(`/sources/${row.id}`, { method: "DELETE" });
      setMsg("Fonte eliminada.");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Falha ao eliminar fonte.");
    }
  };

  return (
    <>
      <div className="toolbar">
        <div>
          <h2 className="h1">Fontes</h2>
          <p className="sub">Gestão de fontes e importação (Excel).</p>
        </div>
      </div>

      {err && (
        <div className="tag bad" style={{ marginBottom: 10 }}>
          {err}
        </div>
      )}
      {msg && (
        <div className="tag ok" style={{ marginBottom: 10 }}>
          {msg}
        </div>
      )}

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
          <div style={{ width: 260 }}>
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
              <option value="INSURANCE">INSURANCE</option>
            </select>
          </div>

          <div style={{ width: 340 }}>
            <label>Origem (onde foi recolhida)</label>
            <input className="input" value={collectedFrom} onChange={(e) => setCollectedFrom(e.target.value)} />
          </div>

          <div style={{ width: 260 }}>
            <label>Ficheiro (opcional)</label>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} accept=".xlsx,.xls,.csv" />
          </div>

          <button className="btn primary" onClick={create}>
            Guardar Fonte
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div className="toolbar" style={{ justifyContent: "space-between" }}>
          <h3 style={{ marginTop: 0 }}>Pesquisar</h3>
          <input
            className="input"
            placeholder="Nome, categoria, origem..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ maxWidth: 520 }}
          />
        </div>

        <table className="table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Origem</th>
              <th>Estado</th>
              <th style={{ width: 220 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.category}</td>
                <td>{s.collected_from}</td>
                <td>
                  <span className="tag ok">{s.status}</span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn" onClick={() => openEdit(s)}>
                    Editar
                  </button>{" "}
                  <button className="btn" onClick={() => removeSource(s)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ opacity: 0.8 }}>
                  Sem registos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={editOpen}
        title={editRow ? `Editar Fonte: ${editRow.name}` : "Editar Fonte"}
        onClose={() => setEditOpen(false)}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label>Nome</label>
            <input className="input" value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>

          <div>
            <label>Categoria</label>
            <select className="input" value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
              <option value="PEP">PEP</option>
              <option value="SANCTIONS">SANCTIONS</option>
              <option value="WATCHLIST">WATCHLIST</option>
              <option value="ADVERSE_MEDIA">ADVERSE_MEDIA</option>
              <option value="INSURANCE">INSURANCE</option>
            </select>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label>Origem (onde foi recolhida)</label>
            <input
              className="input"
              value={editCollectedFrom}
              onChange={(e) => setEditCollectedFrom(e.target.value)}
            />
          </div>

          <div>
            <label>Status</label>
            <select className="input" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>

        <div className="toolbar" style={{ justifyContent: "flex-end", marginTop: 14 }}>
          <button className="btn" onClick={() => setEditOpen(false)}>
            Cancelar
          </button>
          <button className="btn primary" onClick={saveEdit}>
            Guardar alterações
          </button>
        </div>
      </Modal>
    </>
  );
}
