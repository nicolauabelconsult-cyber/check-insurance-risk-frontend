import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Logout() {
  const { setToken } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    setToken(null);
    nav("/login", { replace: true });
  }, []); // eslint-disable-line

  return <div className="p-6 text-sm text-neutral-400">Signing out…</div>;
}
