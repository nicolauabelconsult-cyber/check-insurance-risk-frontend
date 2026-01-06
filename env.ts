export function apiBaseUrl(): string {
  // Netlify sometimes uses VITE_API_URL; our preferred name is VITE_API_BASE_URL.
  const v = (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_API_URL;
  return v || "http://localhost:8000";
}
