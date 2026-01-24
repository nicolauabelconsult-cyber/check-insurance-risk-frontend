import axios from "axios";
import { API_URL } from "./env";

export const api = axios.create({
  baseURL: API_URL,
});

export function setToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}
