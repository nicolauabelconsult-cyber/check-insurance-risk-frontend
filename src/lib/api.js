import axios from "axios";
import { apiBaseUrl } from "./env";
import { tokenStorage } from "../auth/tokenStorage";

export const api = axios.create({ baseURL: apiBaseUrl(), timeout: 30000 });

api.interceptors.request.use((config) => {
  const t = tokenStorage.get();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});
