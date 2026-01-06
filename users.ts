import { api } from "./client";
import type { UserCreate, UserRead, UserUpdate } from "../types";

export async function listUsers() {
  const res = await api.get<UserRead[]>("/api/users");
  return res.data;
}
export async function getUser(id: number) {
  const res = await api.get<UserRead>(`/api/users/${id}`);
  return res.data;
}
export async function createUser(payload: UserCreate) {
  const res = await api.post<UserRead>("/api/users", payload);
  return res.data;
}
export async function updateUser(id: number, payload: UserUpdate) {
  const res = await api.patch<UserRead>(`/api/users/${id}`, payload);
  return res.data;
}
