import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "../auth/AuthContext";
import RequireAuth from "../auth/RequireAuth";
import RequireAdmin from "../auth/RequireAdmin";

import Login from "../pages/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Users from "../pages/Users.jsx";
import Sources from "../pages/Sources.jsx";
import Analyses from "../pages/Analyses.jsx";
import Logout from "../pages/Logout.jsx";

import AppLayout from "./AppLayout.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="sources" element={<Sources />} />
          <Route path="analyses" element={<Analyses />} />
          <Route
            path="users"
            element={
              <RequireAdmin>
                <Users />
              </RequireAdmin>
            }
          />
          <Route path="logout" element={<Logout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
