const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://check-insurance-risk-backend-railway.onrender.com";

export async function apiGet<T>(path: string): Promise<T> {
  const token = localStorage.getItem("cir_token");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`GET ${path} failed: ${res.status} ${txt}`);
  }
  return res.json() as Promise<T>;
}
