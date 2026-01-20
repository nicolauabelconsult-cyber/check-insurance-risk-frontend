import { apiFetch, apiGet } from "./http";

export type Role =
  | "SUPER_ADMIN"
  | "PLATFORM_ADMIN"
  | "CLIENT_ADMIN"
  | "CLIENT_ANALYST";

export type UserMe = {
  id: number;
  username: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  entity_id?: number | null;
  is_active?: boolean;
};

export type TokenOut = {
  access_token: string;
  token_type?: string;
};

export async function login(username: string, password: string): Promise<TokenOut> {
  // OAuth2PasswordRequestForm -> application/x-www-form-urlencoded
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);

  // tenta /auth/login e /api/auth/login via apiFetch (candidates)
  return apiFetch<TokenOut>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    raw: false,
  });
}

export async function me(): Promise<UserMe> {
  // tenta /auth/me e /api/auth/me via apiGet (candidates)
  return apiGet<UserMe>("/auth/me");
}
