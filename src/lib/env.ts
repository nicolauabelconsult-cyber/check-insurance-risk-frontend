export function apiBaseUrl(): string {
  const v = (import.meta as any).env?.VITE_API_URL as string | undefined;
  if (!v) return "http://localhost:8000";
  return v.replace(/\/+$/, "");
}
