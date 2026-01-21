import { apiFetch } from "../lib/http";
import type { User } from "../lib/types";

export async function listUsers(token: string) {
  return apiFetch<User[]>("/users", { token });
}

export async function createUser(token: string, payload: { username: string; password: string; role: string; entity_id?: number | null; name?: string | null; email?: string | null; }) {
  return apiFetch<User>("/users", { token, method: "POST", body: payload });
}
