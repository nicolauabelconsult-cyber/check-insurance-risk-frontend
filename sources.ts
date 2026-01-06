import { api } from "./client";
import type { InfoSourceRead } from "../types";

export async function listSources() {
  const res = await api.get<InfoSourceRead[]>("/api/info-sources");
  return res.data;
}
export async function uploadSourceExcel(file: File, name: string, description?: string) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("name", name);
  if (description) fd.append("description", description);
  const res = await api.post("/api/info-sources/upload-excel", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
export async function sampleEntities(sourceId: number, limit = 5) {
  const res = await api.get(`/api/info-sources/${sourceId}/sample`, { params: { limit } });
  return res.data;
}
