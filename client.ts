import axios from "axios";
import { tokenStorage } from "../auth/tokenStorage";
import { apiBaseUrl } from "../lib/env";

export const api = axios.create({
  baseURL: apiBaseUrl(),
  timeout: 25000,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
