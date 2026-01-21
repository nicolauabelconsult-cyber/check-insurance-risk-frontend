import { apiFetch } from "../lib/http";
import type { TokenOut, User } from "../lib/types";

export async function login(username: string, password: string) {
  const form = new URLSearchParams();
  form.set("username", username);
  form.set("password", password);
  const res = await apiFetch<TokenOut>("/auth/login", { method: "POST", form });
  return res;
}

export async function me(token: string) {
  return apiFetch<User>("/auth/me", { token });
}
