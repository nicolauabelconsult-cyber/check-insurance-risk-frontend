const API = import.meta.env.VITE_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("cir_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as any),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.detail || `HTTP ${res.status}`);
  }

  return data;
}
