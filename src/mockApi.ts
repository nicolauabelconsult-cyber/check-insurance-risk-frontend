export const mockLogin = async () => ({
  user: {
    id: "1",
    name: "Nicolau Abel",
    email: "nicolau@checkinsurancerisk.com",
    role: "SUPER_ADMIN",
    permissions: [
      "risk:read","risk:create","risk:pdf:download",
      "sources:read","sources:upload",
      "users:read","users:create","users:update",
      "audit:read"
    ]
  }
});

let risks: any[] = [
  {
    id: "1",
    ref: "RISK-2026-000001",
    name: "João Manuel",
    risk_level: "HIGH",
    score: 78,
    pep: { is_pep: true, role_or_function: "Ministro das Finanças" }
  }
];

export async function listRisks(){ return risks; }
export async function getRisk(id: string){ return risks.find(r => r.id === id); }
export async function createRisk(name: string){
  const id = String(risks.length + 1);
  const ref = `RISK-2026-${String(risks.length + 1).padStart(6,"0")}`;
  const r = { id, ref, name, risk_level:"MEDIUM", score:55, pep:{ is_pep:false } };
  risks.unshift(r);
  return r;
}

export async function downloadPdf(ref: string){
  const content = `PDF Técnico (mock)\nRef: ${ref}\nData: ${new Date().toISOString()}\n`;
  return new Blob([content], { type:"application/pdf" });
}

let sources: any[] = [
  { id:"src-1", name:"PEP Angola 2026.xlsx", type:"EXCEL", status:"READY", uploaded_by:{name:"Nicolau Abel"}, created_at:new Date().toISOString() }
];
export async function listSources(){ return sources; }
export async function uploadSource(file: File){
  sources.unshift({ id: crypto.randomUUID(), name:file.name, type:"PDF", status:"READY", uploaded_by:{name:"Nicolau Abel"}, created_at:new Date().toISOString() });
}

let users: any[] = [
  { id:"usr-1", name:"Nicolau Abel", email:"nicolau@checkinsurancerisk.com", role:"SUPER_ADMIN", status:"ACTIVE" }
];
export async function listUsers(){ return users; }

let audit: any[] = [
  { id:"aud-1", action:"RISK_CREATED", actor:{name:"Nicolau Abel"}, entity_name:"Banco X", target_ref:"RISK-2026-000001", created_at:new Date().toISOString() }
];
export async function listAudit(){ return audit; }
