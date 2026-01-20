export function apiBaseUrl(): string {
  const v = import.meta.env.VITE_API_URL as string | undefined;
  if (!v) return "http://localhost:8000";
  return v.replace(/\/+$/, "");
}

export function apiCandidates(): string[] {
  const base = apiBaseUrl();
  const out = [base];
  if (!base.endsWith("/api")) out.push(`${base}/api`);
  return Array.from(new Set(out.map((s) => s.replace(/\/+$/, ""))));
}
