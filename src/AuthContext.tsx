import { createContext, useContext, useState } from "react";
import { mockLogin } from "./mockApi";
import { User } from "../../lib/rbac/types";

const Ctx = createContext<any>(null);

export function AuthProvider({ children }: any) {
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

export const useAuth = () => useContext(Ctx);
