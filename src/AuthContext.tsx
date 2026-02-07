import { createContext, useContext, useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  entity?: { id: string; name: string } | null;
};

type AuthCtx = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>(null as any);

async function apiJson(path: string, options: RequestInit = {}, token?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as any),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.detail || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("cir_token");
    const savedUser = localStorage.getItem("cir_user");

    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));

    if (savedToken) {
      apiJson("/auth/me", { method: "GET" }, savedToken)
        .then((me) => {
          setUser(me);
          localStorage.setItem("cir_user", JSON.stringify(me));
        })
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem("cir_token");
          localStorage.removeItem("cir_user");
        });
    }
  }, []);

  async function login(email: string, password: string) {
    try {
      const data = await apiJson("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const access = data.access_token as string;
      const u = data.user as User;

      setToken(access);
      setUser(u);
      localStorage.setItem("cir_token", access);
      localStorage.setItem("cir_user", JSON.stringify(u));

      return true;
    } catch (e: any) {
      console.error("LOGIN ERROR:", e?.message || e);
      return false;
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("cir_token");
    localStorage.removeItem("cir_user");
  }

  return <Ctx.Provider value={{ user, token, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
