// src/Users.tsx
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";
import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  entity?: { id: string; name: string } | null;
};

type CreateUserResponse = {
  user: UserRow;
  temp_password?: string | null;
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
      <input
        className="input"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Users() {
  const { user } = useAuth();

  // Ajusta conforme a tua regra: SUPER_ADMIN/ADMIN/CLIENT_ADMIN podem gerir users
  const allowed = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN" || user?.role === "CLIENT_ADMIN";
  if (!allowed) return <Navigate to="/dashboard" replace />;

  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [createdTemp, setCreatedTemp] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await apiFetch("/users");
      setRows(Array.isArray(r) ? (r as UserRow[]) : []);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <div>
          <h2 style={{ margin: 0 }}>Utilizadores</h2>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>Gestão interna da plataforma.</div>
        </div>

        <button className="btn" onClick={() => { setCreatedTemp(null); setOpen(true); }}>
          Criar Utilizador
        </button>
      </div>

      {createdTemp ? (
        <div className="card" style={{ marginTop: 12, padding: 12, borderLeft: "4px solid #16a34a" }}>
          <b>Password temporária gerada</b>
          <div style={{ marginTop: 6, fontFamily: "monospace" }}>{createdTemp}</div>
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button
              className="btn"
              onClick={async () => {
                await navigator.clipboard.writeText(createdTemp);
              }}
            >
              Copiar
            </button>
            <button className="btn" onClick={() => setCreatedTemp(null)}>
              Fechar
            </button>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
            Entrega esta password ao utilizador. Troca de password ficará para fase seguinte.
          </div>
        </div>
      ) : null}

      {loading ? <p style={{ marginTop: 12 }}>A carregar…</p> : null}
      {err ? (
        <div className="card" style={{ marginTop: 12, padding: 12, borderLeft: "4px solid #b91c1c" }}>
          <b>Erro</b>
          <div style={{ marginTop: 6, fontFamily: "monospace", fontSize: 12 }}>{err}</div>
        </div>
      ) : null}

      <div className="card" style={{ marginTop: 12, padding: 12 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Role</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td style={{ fontFamily: "monospace", fontSize: 12 }}>{r.role}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open ? (
        <CreateUserModal
          onClose={() => setOpen(false)}
          onCreated={async (resp) => {
            setOpen(false);
            if (resp.temp_password) setCreatedTemp(resp.temp_password);
            await refresh();
          }}
          canSetEntity={user?.role === "SUPER_ADMIN" || user?.role === "ADMIN"}
        />
      ) : null}
    </div>
  );
}

function CreateUserModal({
  onClose,
  onCreated,
  canSetEntity,
}: {
  onClose: () => void;
  onCreated: (resp: CreateUserResponse) => void;
  canSetEntity: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("CLIENT_ANALYST");
  const [status, setStatus] = useState("ACTIVE");
  const [entityId, setEntityId] = useState("");
  const [password, setPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const roles = useMemo(
    () => [
      { value: "CLIENT_ANALYST", label: "CLIENT_ANALYST" },
      { value: "CLIENT_ADMIN", label: "CLIENT_ADMIN" },
      { value: "ADMIN", label: "ADMIN" },
    ],
    []
  );

  const statuses = useMemo(
    () => [
      { value: "ACTIVE", label: "ACTIVE" },
      { value: "DISABLED", label: "DISABLED" },
    ],
    []
  );

  const submit = async () => {
    setSaving(true);
    setErr(null);

    try {
      const body: any = {
        name: name.trim(),
        email: email.trim(),
        role,
        status,
      };

      if (canSetEntity && entityId.trim()) body.entity_id = entityId.trim();

      // ✅ SUPER_ADMIN pode definir password
      // Se não preencher, backend gera temp_password e devolve
      if (password.trim()) body.password = password;

      const resp = (await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify(body),
      })) as CreateUserResponse;

      onCreated(resp);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "grid",
        placeItems: "center",
        padding: 14,
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div className="card" style={{ width: 720, maxWidth: "100%", padding: 14 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Criar Utilizador</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Nome" value={name} onChange={setName} placeholder="Nome do utilizador" />
          <Field label="Email" value={email} onChange={setEmail} placeholder="email@dominio.com" />

          <Select label="Role" value={role} onChange={setRole} options={roles} />
          <Select label="Estado" value={status} onChange={setStatus} options={statuses} />

          {canSetEntity ? (
            <Field label="Entity ID (opcional)" value={entityId} onChange={setEntityId} placeholder="UUID da entidade" />
          ) : (
            <div style={{ fontSize: 12, opacity: 0.7, alignSelf: "end" }}>
              Entity é aplicada automaticamente ao teu escopo.
            </div>
          )}

          <Field
            label="Password (opcional)"
            value={password}
            onChange={setPassword}
            type="password"
            placeholder="Se vazio, gera password temporária"
          />
        </div>

        {err ? (
          <div className="card" style={{ marginTop: 12, padding: 10, borderLeft: "4px solid #b91c1c" }}>
            <b>Erro</b>
            <div style={{ marginTop: 6, fontFamily: "monospace", fontSize: 12 }}>{err}</div>
          </div>
        ) : null}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <button className="btn" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="btn" onClick={submit} disabled={saving}>
            {saving ? "A guardar…" : "Guardar"}
          </button>
        </div>

        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
          Se não definires password, o backend gera uma temporária e devolve para copiares.
        </div>
      </div>
    </div>
  );
}
