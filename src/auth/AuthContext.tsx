import React, { createContext, useContext, useMemo, useState } from "react";
import { tokenStorage } from "./tokenStorage";
import { me, type UserRead } from "../api/auth";

type AuthCtx = {
  token: string | null;
  user: UserRead | null;
  setToken: (t: string | null) => void;
  refreshMe: () => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => tokenStorage.get());
  const [user, setUser] = useState<UserRead | null>(null);

  const setToken = (t: string | null) => {
    setTokenState(t);
    tokenStorage.set(t);
    if (!t) setUser(null);
  };

  const refreshMe = async () => {
    if (!token) { setUser(null); return; }
    const u = await me(token);
    setUser(u);
  };

  const logout = () => setToken(null);

  const value = useMemo(() => ({ token, user, setToken, refreshMe, logout }), [token, user]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
