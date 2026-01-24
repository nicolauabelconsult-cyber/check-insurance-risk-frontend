import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  return (
    <>
      <h2>Login</h2>
      <button onClick={async () => {
        await login();
        nav("/risks");
      }}>
        Entrar
      </button>
    </>
  );
}
