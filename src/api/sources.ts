import { apiFetch } from "../lib/http";
import type { InfoSource } from "../lib/types";

export async function listSources(token: string) {
  return apiFetch<InfoSource[]>("/sources", { token });
}

export async function uploadSource(token: string, file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return apiFetch<InfoSource>("/sources", { token, method: "POST", body: fd });
}
