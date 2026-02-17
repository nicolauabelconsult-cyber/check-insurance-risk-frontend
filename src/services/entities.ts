import { apiFetch } from "../api";

export const entitiesApi = {
  list: () => apiFetch("/entities"),
};
