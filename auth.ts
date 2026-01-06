import { api } from "./client";
import type { UserMe } from "../types";

export async function login(username: string, password: string) {
  const body = new URLSearchParams();
  body.append("username", username);
  body.append("password", password);
  const res = await api.post<{ access_token: string; token_type?: string }>(
    "/api/auth/login",
    body,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return res.data;
}
export async function me() {
  const res = await api.get<UserMe>("/api/auth/me");
  return res.data;
}
