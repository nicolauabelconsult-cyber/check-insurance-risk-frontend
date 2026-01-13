import { api } from "../lib/api";

export async function listUsers() {
  const res = await api.get("/api/users");
  return res.data;
}

export async function createUser(payload) {
  const res = await api.post("/api/users", payload);
  return res.data;
}

export async function patchUser(userId, payload) {
  const res = await api.patch(`/api/users/${userId}`, payload);
  return res.data;
}

export async function resetUserPassword(userId, password) {
  const res = await api.post(`/api/users/${userId}/reset-password`, { password });
  return res.data;
}
