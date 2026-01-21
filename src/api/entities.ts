import { apiFetch } from "../lib/http";
import type { Entity } from "../lib/types";

export async function listEntities(token: string) {
  return apiFetch<Entity[]>("/entities", { token });
}

export async function createEntity(token: string, name: string) {
  return apiFetch<Entity>("/entities", { token, method: "POST", body: { name } });
}
