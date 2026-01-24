import { createContext, useContext, useEffect, useState } from "react";
import { mockLogin } from "./mockApi";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
};

type AuthCtx = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>(null as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("cir_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  async function login(email: string, password: string) {
    const res = await mockLogin(email, password);
    if (!res) return false;

    setUser(res.user);
    localStorage.setItem("cir_user", JSON.stringify(res.user));
    return true;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("cir_user");
  }

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
