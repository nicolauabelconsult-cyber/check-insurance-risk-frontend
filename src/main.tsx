import "./index.css";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { AuthProvider } from "./AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
console.log("VITE_USE_MOCK_API =", import.meta.env.VITE_USE_MOCK_API);
