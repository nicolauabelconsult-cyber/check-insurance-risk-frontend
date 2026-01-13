import { api } from "../lib/api";

export async function listSources() {
  const res = await api.get("/api/info-sources");
  return res.data;
}

export async function uploadExcel({ file, name, description }) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("name", name);
  if (description) fd.append("description", description);

  const res = await api.post("/api/info-sources/upload-excel", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function sampleSource(id, limit = 10) {
  const res = await api.get(`/api/info-sources/${id}/sample`, { params: { limit } });
  return res.data;
}
