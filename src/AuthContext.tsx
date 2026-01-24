import { createContext, useContext, useState } from "react";
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
  login: () => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>(null as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function login() {
    const res = await mockLogin();
    setUser(res.user);
  }

  function logout() {
    setUser(null);
  }

  return (
    <Ctx.Provider value={{ user, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
