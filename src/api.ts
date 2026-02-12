const API = import.meta.env.VITE_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("cir_token"); // sempre direto do storage

  const headers: Record<string, string> = {
    ...(options.headers as any),
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // ✅ só adiciona se existir e não for "null"/"undefined"
  if (token && token !== "null" && token !== "undefined") {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API}${path}`, { ...options, headers });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);
  return data;
}
