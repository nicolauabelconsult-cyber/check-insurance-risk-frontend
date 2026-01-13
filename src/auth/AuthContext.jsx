import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { tokenStorage } from "./tokenStorage";
import { me as apiMe } from "../api/auth";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => tokenStorage.get());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function setToken(t) {
    setTokenState(t);
    if (t) tokenStorage.set(t);
    else tokenStorage.clear();
  }

  async function refreshMe() {
    if (!tokenStorage.get()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const u = await apiMe();
      setUser(u);
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refreshMe(); }, []); // initial

  const value = useMemo(() => ({
    token, user, loading,
    setToken,
    refreshMe,
    isAdmin: user?.role === "ADMIN",
  }), [token, user, loading]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
