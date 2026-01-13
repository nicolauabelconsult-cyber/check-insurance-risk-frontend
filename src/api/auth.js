import { api } from "../lib/api";

export async function login(username, password) {
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);

  const res = await api.post("/api/auth/login", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return res.data;
}

export async function me() {
  const res = await api.get("/api/auth/me");
  return res.data;
}
