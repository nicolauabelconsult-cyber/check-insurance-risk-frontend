import { apiBaseUrl } from "./env";

export class ApiError extends Error {
  status: number;
  detail: any;
  constructor(status: number, detail: any) {
    super(typeof detail === "string" ? detail : "API Error");
    this.status = status;
    this.detail = detail;
  }
}

function authHeader(token?: string | null): Record<string, string> {
  const h: Record<string, string> = {};
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

export async function apiFetch<T>(
  path: string,
  opts: {
    method?: string;
    token?: string | null;
    body?: any;
    headers?: Record<string, string>;
    form?: URLSearchParams;
  } = {}
): Promise<T> {
  const url = `${apiBaseUrl()}${path.startsWith("/") ? "" : "/"}${path}`;
  const method = opts.method ?? "GET";
  const headers: Record<string, string> = {
    ...authHeader(opts.token),
    ...(opts.headers ?? {}),
  };

  let body: any = undefined;

  if (opts.form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = opts.form.toString();
  } else if (opts.body instanceof FormData) {
    body = opts.body;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, { method, headers, body });
  const ct = res.headers.get("content-type") || "";
  const payload = ct.includes("application/json") ? await res.json().catch(() => null) : await res.text().catch(() => "");
  if (!res.ok) {
    const detail = (payload && (payload.detail ?? payload.message)) ? (payload.detail ?? payload.message) : payload;
    throw new ApiError(res.status, detail);
  }
  return payload as T;
}
