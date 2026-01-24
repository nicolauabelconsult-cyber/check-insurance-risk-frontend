export async function mockLogin(email: string, password: string) {
  if (email === "nicolau@checkinsurancerisk.com" && password === "Qwerty080397") {
    return {
      user: {
        id: "usr-1",
        name: "Nicolau Abel",
        email,
        role: "SUPER_ADMIN",
        permissions: [
          "risk:read",
          "risk:create",
          "risk:pdf:download",
          "sources:read",
          "sources:upload",
          "users:read",
          "users:create",
          "users:update",
          "audit:read",
        ],
      },
    };
  }
  return null;
}

// ---------------- RISKS ----------------
let risks: any[] = [
  {
    id: "risk-1",
    ref: "RISK-2026-000001",
    name: "João Manuel",
    risk_level: "HIGH",
    score: 78,
    pep: { is_pep: true, role_or_function: "Ministro das Finanças" },
  },
];

export async function listRisks() {
  return risks;
}

export async function getRisk(id: string) {
  return risks.find((r) => r.id === id);
}

export async function createRisk(name: string) {
  const seq = risks.length + 1;
  const id = `risk-${seq}`;
  const ref = `RISK-2026-${String(seq).padStart(6, "0")}`;
  const r = {
    id,
    ref,
    name,
    risk_level: "MEDIUM",
    score: 55,
    pep: { is_pep: false, role_or_function: "" },
  };
  risks.unshift(r);
  // auditoria
  audit.unshift({
    id: crypto.randomUUID(),
    action: "RISK_CREATED",
    actor: { name: "Nicolau Abel" },
    entity_name: "Banco X",
    target_ref: ref,
    created_at: new Date().toISOString(),
  });
  return r;
}

export async function downloadPdf(ref: string) {
  const content = `CHECK INSURANCE RISK – PDF TÉCNICO (MOCK)
Referência: ${ref}
Data: ${new Date().toISOString()}

Este PDF é demonstrativo (mock).
`;
  return new Blob([content], { type: "application/pdf" });
}

// ---------------- SOURCES ----------------
let sources: any[] = [
  {
    id: "src-1",
    name: "PEP Angola 2026.xlsx",
    type: "EXCEL",
    status: "READY",
    uploaded_by: { name: "Nicolau Abel" },
    created_at: new Date().toISOString(),
  },
];

export async function listSources() {
  return sources;
}

export async function uploadSource(file: File) {
  const ext = (file.name.split(".").pop() || "").toUpperCase();
  const type = ext === "CSV" ? "CSV" : ext === "XLSX" ? "EXCEL" : "PDF";

  const item = {
    id: crypto.randomUUID(),
    name: file.name,
    type,
    status: "READY",
    uploaded_by: { name: "Nicolau Abel" },
    created_at: new Date().toISOString(),
  };

  sources.unshift(item);

  // auditoria
  audit.unshift({
    id: crypto.randomUUID(),
    action: "SOURCE_UPLOADED",
    actor: { name: "Nicolau Abel" },
    entity_name: null,
    target_ref: file.name,
    created_at: new Date().toISOString(),
  });

  return item;
}

// ---------------- USERS (CRUD) ----------------
let users: any[] = [
  {
    id: "usr-1",
    name: "Nicolau Abel",
    email: "nicolau@checkinsurancerisk.com",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
  },
];

export async function listUsers() {
  return users;
}

export async function createUser(data: any) {
  const u = {
    id: crypto.randomUUID(),
    name: data.name,
    email: data.email,
    role: data.role,
    status: data.status,
  };
  users.unshift(u);

  // auditoria
  audit.unshift({
    id: crypto.randomUUID(),
    action: "USER_CREATED",
    actor: { name: "Nicolau Abel" },
    entity_name: null,
    target_ref: data.email,
    created_at: new Date().toISOString(),
  });

  return u;
}

export async function getUserById(id: string) {
  return users.find((u) => u.id === id);
}

export async function updateUser(id: string, data: any) {
  const i = users.findIndex((u) => u.id === id);
  if (i === -1) return null;

  users[i] = {
    ...users[i],
    name: data.name ?? users[i].name,
    email: data.email ?? users[i].email,
    role: data.role ?? users[i].role,
    status: data.status ?? users[i].status,
  };

  // auditoria
  audit.unshift({
    id: crypto.randomUUID(),
    action: "USER_UPDATED",
    actor: { name: "Nicolau Abel" },
    entity_name: null,
    target_ref: users[i].email,
    created_at: new Date().toISOString(),
  });

  return users[i];
}

// ---------------- AUDIT ----------------
let audit: any[] = [
  {
    id: "aud-1",
    action: "RISK_CREATED",
    actor: { name: "Nicolau Abel" },
    entity_name: "Banco X",
    target_ref: "RISK-2026-000001",
    created_at: new Date().toISOString(),
  },
];

export async function listAudit() {
  return audit;
}
