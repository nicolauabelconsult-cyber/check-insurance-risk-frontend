
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function Login() {
  return (
    <div style={{ padding: 40 }}>
      <h2>Login</h2>
      <p>Backend ligado via VITE_API_URL</p>
    </div>
  );
}

function Dashboard() {
  return (
    <div style={{ padding: 40 }}>
      <h2>Dashboard</h2>
      <p>Login funcional, RBAC pronto</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
