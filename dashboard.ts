import { api } from "./client";
import type { DashboardStats } from "../types";
export async function getStats() {
  const res = await api.get<DashboardStats>("/api/dashboard/stats");
  return res.data;
}
