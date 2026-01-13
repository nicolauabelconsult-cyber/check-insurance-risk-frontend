import { apiBaseUrl } from "../lib/env";

export type TokenOut = { access_token: string; token_type: "bearer" };

export async function login(username: string, password: string): Promise<TokenOut> {
  const url = `${apiBaseUrl()}/api/auth/login`;
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    let detail: any = null;
    try { detail = await res.json(); } catch {}
    const err: any = new Error(detail?.detail || `HTTP ${res.status}`);
    (err as any).response = { status: res.status, data: detail };
    throw err;
  }
  return (await res.json()) as TokenOut;
}

export type UserRead = {
  id: number;
  username: string;
  name: string | null;
  email: string | null;
  role: "ADMIN" | "ANALYST";
  is_active: boolean;
};

export async function me(token: string): Promise<UserRead> {
  const url = `${apiBaseUrl()}/api/auth/me`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let detail: any = null;
    try { detail = await res.json(); } catch {}
    const err: any = new Error(detail?.detail || `HTTP ${res.status}`);
    (err as any).response = { status: res.status, data: detail };
    throw err;
  }
  return (await res.json()) as UserRead;
}
