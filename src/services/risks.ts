import { apiFetch } from "../api";

export const risksApi = {
  list: () => apiFetch("/risks"),
  get: (id: string) => apiFetch(`/risks/${id}`),

  search: (payload: { entity_id: string; name: string; nationality?: string }) =>
    apiFetch("/risks/search", { method: "POST", body: JSON.stringify(payload) }),

  confirm: (payload: {
    entity_id: string;
    candidate_id: string;
    name: string;
    nationality: string;
    id_type: "BI" | "PASSPORT";
    id_number: string;
  }) =>
    apiFetch("/risks/confirm", { method: "POST", body: JSON.stringify(payload) }),
};
