import { apiFetch } from "../lib/http";
import type { Analysis } from "../lib/types";

export async function listAnalyses(token: string) {
  return apiFetch<Analysis[]>("/analyses", { token });
}

export async function createAnalysis(token: string, subject_name: string) {
  return apiFetch<Analysis>("/analyses", { token, method: "POST", body: { subject_name } });
}
