import { api } from "../lib/api";

export async function getStats() {
  const res = await api.get("/api/dashboard/stats");
  return res.data;
}
