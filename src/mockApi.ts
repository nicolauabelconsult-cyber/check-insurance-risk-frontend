// src/mockApi.ts

type Entity = { id: string; name: string };
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  entity_id?: string | null;
  entity_name?: string | null;
  password?: string;
};
type AuditLog = {
  id: string;
  action: string;
  actor: { name: string };
  entity_name: string | null;
  target_ref: string | null;
  created_at: string;
};

function nowISO() {
  return new Date().toISOString();
}

function getCurrentUser(): any | null {
  try {
    const raw = localStorage.getItem("cir_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function canSeeAllEntities(u: any) {
  return u?.role === "SUPER_ADMIN" || u?.role === "ADMIN";
}

// ---------------- ENTITIES ----------------
let entities: Entity[] = [
  { id: "ent-1", name: "Banco X" },
  { id: "ent-2", name: "Seguradora Y" },
];

export async function listEntities() {
  return entities;
}

// ---------------- AUTH ----------------
export async function mockLogin(email: string, password: string) {
  // SUPER ADMIN (plataforma): vê tudo
  if (email === "nicolau@checkinsurancerisk.com" && password === "Qwerty080397") {
    return {
      user: {
        id: "usr-1",
        name: "Nicolau Abel",
        email,
        role: "SUPER_ADMIN",
        entity_id: null,
        entity_name: "PLATFORM",
        permissions: [
          "entities:read",
          "risk:read",
          "risk:create",
          "risk:pdf:download",
          "sources:read",
          "sources:upload",
          "sources:update",
          "sources:delete",
          "users:read",
          "users:create",
          "users:update",
          "users:delete",
          "audit:read",
        ],
      },
    };
  }

  // Outros utilizadores (mock): permite login se existir na lista e password coincidir
  const u = users.find((x) => x.email === email && x.password === password);
  if (!u) return null;

  return {
    user: {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      entity_id: u.entity_id ?? null,
      entity_name: u.entity_name ?? null,
      permissions: [
        "risk:read",
        "risk:create",
        "risk:pdf:download",
        "sources:read",
        "audit:read",
      ],
    },
  };
}

// ---------------- DATASET (candidatos) ----------------
type Candidate = {
  id: string;
  full_name: string;
  nationality: string;
  dob?: string;
  doc_type?: "BI" | "PASSPORT";
  doc_last4?: string;
  doc_full?: string; // mock only
  sources: string[];
};

let candidates: Candidate[] = [
  {
    id: "cand-1",
    full_name: "João Manuel",
    nationality: "Angolana",
    dob: "1980-02-11",
    doc_type: "BI",
    doc_full: "BI123456789AO",
    doc_last4: "9AO",
    sources: ["PEP Angola 2026", "Lista Interna Banco X"],
  },
  {
    id: "cand-2",
    full_name: "João Manuel",
    nationality: "Portuguesa",
    dob: "1976-10-03",
    doc_type: "PASSPORT",
    doc_full: "P1234567",
    doc_last4: "4567",
    sources: ["News Archive", "Sanctions Watchlist"],
  },
  {
    id: "cand-3",
    full_name: "João Manuel António",
    nationality: "Angolana",
    dob: "1988-05-19",
    doc_type: "BI",
    doc_full: "BI987654321AO",
    doc_last4: "1AO",
    sources: ["PEP Angola 2026"],
  },
];

// ---------------- RISKS ----------------
let risks: any[] = [
  {
    id: "risk-1",
    entity_id: "ent-1",
    entity_name: "Banco X",
    ref: "RISK-2026-000001",
    query: { name: "João Manuel", nationality: "Angolana" },
    matched_candidate: "cand-1",
    name: "João Manuel",
    nationality: "Angolana",
    id_type: "BI",
    id_number: "BI123456789AO",
    risk_level: "HIGH",
    score: 78,
    pep: { is_pep: true, role_or_function: "Ministro das Finanças" },
    sources_used: ["PEP Angola 2026", "Lista Interna Banco X"],
    created_at: nowISO(),
    created_by: "Nicolau Abel",
  },
];

function scopeFilter<T extends { entity_id?: string | null }>(arr: T[]) {
  const u = getCurrentUser();
  if (!u) return [];
  if (canSeeAllEntities(u)) return arr;
  return arr.filter((x) => x.entity_id === u.entity_id);
}

export async function listRisks() {
  return scopeFilter(risks);
}

export async function getRisk(id: string) {
  const scoped = scopeFilter(risks);
  return scoped.find((r) => r.id === id);
}

// procura candidatos por nome (+ filtros opcionais)
export async function searchCandidates(params: {
  name: string;
  nationality?: string;
}) {
  const name = (params.name || "").trim().toLowerCase();
  const nat = (params.nationality || "").trim().toLowerCase();

  const hits = candidates
    .filter((c) => c.full_name.toLowerCase().includes(name))
    .map((c) => {
      // score simples
      let score = 0;
      const exact = c.full_name.toLowerCase() === name;
      score += exact ? 60 : 40;
      if (nat && c.nationality.toLowerCase().includes(nat)) score += 20;
      // bônus se tiver documento e DOB
      if (c.doc_type && c.doc_last4) score += 10;
      if (c.dob) score += 10;

      return {
        id: c.id,
        full_name: c.full_name,
        nationality: c.nationality,
        dob: c.dob,
        doc_type: c.doc_type,
        doc_last4: c.doc_last4,
        sources: c.sources,
        match_score: Math.min(score, 100),
      };
    })
    .sort((a, b) => b.match_score - a.match_score);

  // Auditoria (SEARCH)
  const u = getCurrentUser();
  audit.unshift({
    id: crypto.randomUUID(),
    action: "RISK_SEARCH",
    actor: { name: u?.name ?? "Unknown" },
    entity_name: u?.entity_name ?? null,
    target_ref: `${params.name} | results=${hits.length}`,
    created_at: nowISO(),
  });

  return hits;
}

// confirmar candidato + identificadores fortes e criar análise final
export async function confirmAnalysis(input: {
  candidate_id: string;
  name: string;
  nationality: string;
  id_type: "BI" | "PASSPORT";
  id_number: string;
}) {
  const u = getCurrentUser();
  if (!u) throw new Error("Not authenticated");

  const ent =
    canSeeAllEntities(u) ? entities[0] : entities.find((e) => e.id === u.entity_id) || entities[0];

  const cand = candidates.find((c) => c.id === input.candidate_id);

  const seq = risks.length + 1;
  const id = `risk-${seq}`;
  const ref = `RISK-2026-${String(seq).padStart(6, "0")}`;

  // mock score/risk (depois será backend)
  const isPep = !!cand?.sources?.some((s) => s.toLowerCase().includes("pep"));
  const score = isPep ? 78 : 35;
  const risk_level = score >= 75 ? "HIGH" : score >= 50 ? "MEDIUM" : "LOW";

  const r = {
    id,
    entity_id: ent.id,
    entity_name: ent.name,
    ref,
    query: { name: input.name, nationality: input.nationality },
    matched_candidate: input.candidate_id,
    name: input.name,
    nationality: input.nationality,
    id_type: input.id_type,
    id_number: input.id_number,
    risk_level,
    score,
    pep: {
      is_pep: isPep,
      role_or_function: isPep ? "Cargo em fonte PEP (mock)" : "",
    },
    sources_used: cand?.sources ?? [],
    created_at: nowISO(),
    created_by: u.name,
  };

  risks.unshift(r);

  audit.unshift({
    id: crypto.randomUUID(),
    action: "RISK_CREATED",
    actor: { name: u.name },
    entity_name: ent.name,
    target_ref: ref,
    created_at: nowISO(),
  });

  return r;
}

export async function downloadPdf(ref: string) {
  const r = risks.find((x) => x.ref === ref);
  const content = `CHECK INSURANCE RISK – PDF TÉCNICO (MOCK)

Referência: ${r?.ref ?? ref}
Entidade: ${r?.entity_name ?? "-"}
Data: ${new Date(r?.created_at ?? nowISO()).toLocaleString()}

1) Identificação
- Nome: ${r?.name ?? "-"}
- Nacionalidade: ${r?.nationality ?? "-"}
- Documento: ${r?.id_type ?? "-"} | ${r?.id_number ?? "-"}

2) Resultado
- Score: ${r?.score ?? "-"}
- Nível: ${r?.risk_level ?? "-"}
- PEP: ${r?.pep?.is_pep ? "Sim" : "Não"} ${r?.pep?.role_or_function ? `(${r.pep.role_or_function})` : ""}

3) Fontes utilizadas
${(r?.sources_used ?? []).map((s: string) => `- ${s}`).join("\n")}

Este PDF é demonstrativo (mock).
`;
  return new Blob([content], { type: "application/pdf" });
}

// ---------------- SOURCES ----------------
let sources: any[] = [
  {
    id: "src-1",
    entity_id: null, // fontes são da plataforma (como combinámos)
    name: "PEP Angola 2026",
    category: "PEP",
    origin: "Ministério / publicação oficial (mock)",
    source_location: "Luanda",
    tags: ["Angola", "PEP", "2026"],
    file_name: "PEP Angola 2026.xlsx",
    type: "EXCEL",
    status: "READY",
    uploaded_by: { name: "Nicolau Abel" },
    created_at: nowISO(),
  },
];

export async function listSources() {
  // fontes são plataforma, SUPER_ADMIN/ADMIN veem todas
  return sources;
}

export async function createSource(meta: {
  name: string;
  category: string;
  origin: string;
  source_location?: string;
  tags?: string[];
  file?: File | null;
}) {
  const u = getCurrentUser();
  const item = {
    id: crypto.randomUUID(),
    entity_id: null,
    name: meta.name,
    category: meta.category || "UNCATEGORIZED",
    origin: meta.origin || "-",
    source_location: meta.source_location || "",
    tags: meta.tags || [],
    file_name: meta.file?.name || null,
    type: meta.file
      ? ((meta.file.name.split(".").pop() || "").toUpperCase() === "CSV"
          ? "CSV"
          : (meta.file.name.split(".").pop() || "").toUpperCase() === "XLSX"
          ? "EXCEL"
          : "PDF")
      : "N/A",
    status: "READY",
    uploaded_by: { name: u?.name ?? "Unknown" },
    created_at: nowISO(),
  };

  sources.unshift(item);

  audit.unshift({
    id: crypto.randomUUID(),
    action: "SOURCE_CREATED",
    actor: { name: u?.name ?? "Unknown" },
    entity_name: u?.entity_name ?? null,
    target_ref: item.name,
    created_at: nowISO(),
  });

  return item;
}

export async function updateSource(id: string, data: any) {
  const i = sources.findIndex((s) => s.id === id);
  if (i === -1) return null;

  sources[i] = {
    ...sources[i],
    name: data.name ?? sources[i].name,
    category: data.category ?? sources[i].category,
    origin: data.origin ?? sources[i].origin,
    source_location: data.source_location ?? sources[i].source_location,
    tags: data.tags ?? sources[i].tags,
    status: data.status ?? sources[i].status,
  };

  const u = getCurrentUser();
  audit.unshift({
    id: crypto.randomUUID(),
    action: "SOURCE_UPDATED",
    actor: { name: u?.name ?? "Unknown" },
    entity_name: u?.entity_name ?? null,
    target_ref: sources[i].name,
    created_at: nowISO(),
  });

  return sources[i];
}

export async function deleteSource(id: string) {
  const i = sources.findIndex((s) => s.id === id);
  if (i === -1) return false;

  const removed = sources[i];
  sources.splice(i, 1);

  const u = getCurrentUser();
  audit.unshift({
    id: crypto.randomUUID(),
    action: "SOURCE_DELETED",
    actor: { name: u?.name ?? "Unknown" },
    entity_name: u?.entity_name ?? null,
    target_ref: removed.name,
    created_at: nowISO(),
  });

  return true;
}

// ---------------- USERS ----------------
let users: User[] = [
  {
    id: "usr-2",
    name: "Cliente Banco X",
    email: "cliente@bancox.com",
    role: "CLIENT_ANALYST",
    status: "ACTIVE",
    entity_id: "ent-1",
    entity_name: "Banco X",
    password: "1234",
  },
];

export async function listUsers() {
  const u = getCurrentUser();
  if (!u) return [];
  if (canSeeAllEntities(u)) return users;
  return users.filter((x) => x.entity_id === u.entity_id);
}

export async function createUser(data: any) {
  const u = getCurrentUser();
  const ent = entities.find((e) => e.id === data.entity_id);

  const item: User = {
    id: crypto.randomUUID(),
    name: data.name,
    email: data.email,
    role: data.role,
    status: data.status,
    entity_id: data.entity_id,
    entity_name: ent?.name ?? null,
    password: data.password, // mock only
  };

  users.unshift(item);

  audit.unshift({
    id: crypto.randomUUID(),
    action: "USER_CREATED",
    actor: { name: u?.name ?? "Unknown" },
    entity_name: item.entity_name ?? null,
    target_ref: item.email,
    created_at: nowISO(),
  });

  return item;
}

export async function getUserById(id: string) {
  const scoped = await listUsers();
  return scoped.find((x) => x.id === id);
}

export async function updateUser(id: string, data: any) {
  const i = users.findIndex((x) => x.id === id);
  if (i === -1) return null;

  const ent = data.entity_id ? entities.find((e) => e.id === data.entity_id) : null;

  users[i] = {
    ...users[i],
    name: data.name ?? users[i].name,
    email: data.email ?? users[i].email,
    role: data.role ?? users[i].role,
    status: data.status ?? users[i].status,
    entity_id: data.entity_id ?? users[i].entity_id,
    entity_name: ent?.name ?? users[i].entity_name,
    password: data.password ? data.password : users[i].password,
  };

  const u = getCurrentUser();
  audit.unshift({
    id: crypto.randomUUID(),
    action: "USER_UPDATED",
    actor: { name: u?.name ?? "Unknown" },
    entity_name: users[i].entity_name ?? null,
    target_ref: users[i].email,
    created_at: nowISO(),
  });

  return users[i];
}

// ---------------- AUDIT ----------------
let audit: AuditLog[] = [
  {
    id: "aud-1",
    action: "RISK_CREATED",
    actor: { name: "Nicolau Abel" },
    entity_name: "Banco X",
    target_ref: "RISK-2026-000001",
    created_at: nowISO(),
  },
];

export async function listAudit() {
  const u = getCurrentUser();
  if (!u) return [];
  if (canSeeAllEntities(u)) return audit;
  // cliente só vê auditoria da sua entidade
  return audit.filter((a) => a.entity_name === u.entity_name);
}
