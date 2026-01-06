import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { tokenStorage } from "./tokenStorage";
import { me as fetchMe } from "../api/auth";
import type { UserMe } from "../types";

type AuthCtx = {
  token: string | null;
  user: UserMe | null;
  isAuthed: boolean;
  isAdmin: boolean;
  setToken: (t: string | null) => void;
  refreshMe: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(tokenStorage.get());
  const [user, setUser] = useState<UserMe | null>(null);

  const setToken = (t: string | null) => {
    if (t) tokenStorage.set(t);
    else tokenStorage.clear();
    setTokenState(t);
  };

  const logout = () => { setUser(null); setToken(null); };

  const refreshMe = async () => {
    if (!tokenStorage.get()) { setUser(null); return; }
    try { setUser(await fetchMe()); } catch { logout(); }
  };

  useEffect(() => { void refreshMe(); }, [token]);

  const value = useMemo(() => ({
    token, user,
    isAuthed: Boolean(token),
    isAdmin: user?.role === "ADMIN",
    setToken, refreshMe, logout
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
