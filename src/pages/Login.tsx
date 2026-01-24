import { useState } from "react";
import { api, setToken } from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await api.post("/auth/login", new URLSearchParams({
      username,
      password
    }));
    setToken(res.data.access_token);
    navigate("/dashboard");
  }

  return (
    <form onSubmit={submit}>
      <h1>Login</h1>
      <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
      <button>Entrar</button>
    </form>
  );
}
