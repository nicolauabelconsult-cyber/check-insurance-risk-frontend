export function apiBaseUrl() {
  const v = import.meta.env.VITE_API_URL;
  return (v && v.trim()) ? v.trim().replace(/\/$/, "") : "http://localhost:8000";
}
