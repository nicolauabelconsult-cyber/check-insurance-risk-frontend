import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard() {
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    api.get("/auth/me").then(r => setMe(r.data));
  }, []);

  if (!me) return <p>A carregar…</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Utilizador: {me.username}</p>
      <p>Role: {me.role}</p>
    </div>
  );
}
