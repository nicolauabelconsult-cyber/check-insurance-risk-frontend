import { apiCandidates } from "../lib/env";
import { tokenStorage } from "../auth/tokenStorage";

export type ApiError = {
  status: number;
  message: string;
  details?: any;
};

async function readJsonSafe(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function buildHeaders(initHeaders?: HeadersInit): Headers {
  const h = new Headers(initHeaders || {});
  const token = tokenStorage.get();
  if (token) h.set("Authorization", `Bearer ${token}`);
  return h;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { json?: any; raw?: boolean } = {}
): Promise<T> {
  const candidates = apiCandidates();

  let lastErr: any = null;

  for (const base of candidates) {
    const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;

    try {
      const headers = buildHeaders(init.headers);

      let body: any = init.body;
      if (init.json !== undefined) {
        headers.set("Content-Type", "application/json");
        body = JSON.stringify(init.json);
      }

      const res = await fetch(url, { ...init, headers, body });

      if (!res.ok) {
        const details = await readJsonSafe(res);
        const err: ApiError = {
          status: res.status,
          message:
            details?.detail ||
            details?.message ||
            `Request failed (${res.status})`,
          details,
        };

        // se der 404, tenta o próximo candidato (/api)
        if (res.status === 404) {
          lastErr = err;
          continue;
        }
        throw err;
      }

      const ct = res.headers.get("content-type") || "";
      if (init.raw) return (await res.text()) as any;
      if (ct.includes("application/json")) return (await res.json()) as T;

      // fallback
      return (await res.text()) as any;
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error("Unable to reach API");
}

export function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: "GET" });
}

export function apiPost<T>(path: string, json?: any): Promise<T> {
  return apiFetch<T>(path, { method: "POST", json });
}

export function toFormData(obj: Record<string, any>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    fd.append(k, v);
  }
  return fd;
}
