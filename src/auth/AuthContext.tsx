import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/http";
import { tokenStorage } from "./tokenStorage";
import type { User } from "../lib/types";

type AuthState = {
  token: string | null;
  me: User | null;
  loading: boolean;
  setToken: (t: string | null) => void;
  refreshMe: () => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => tokenStorage.get());
  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) tokenStorage.set(t);
    else tokenStorage.clear();
  };

  const refreshMe = async () => {
    if (!token) { setMe(null); setLoading(false); return; }
    try {
      const u = await apiFetch<User>("/auth/me", { token });
      setMe(u);
    } catch {
      setMe(null);
      tokenStorage.clear();
      setTokenState(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setMe(null);
    setToken(null);
  };

  useEffect(() => {
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value = useMemo(() => ({ token, me, loading, setToken, refreshMe, logout }), [token, me, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
