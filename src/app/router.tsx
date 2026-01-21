import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import RequireAuth from "../auth/RequireAuth";
import RequireRole from "../auth/RequireRole";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Entities from "../pages/Entities";
import Users from "../pages/Users";
import Sources from "../pages/Sources";
import Analyses from "../pages/Analyses";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Dashboard /> },

      {
        path: "entities",
        element: (
          <RequireRole allow={["SUPER_ADMIN"]}>
            <Entities />
          </RequireRole>
        ),
      },

      {
        path: "users",
        element: (
          <RequireRole allow={["SUPER_ADMIN", "PLATFORM_ADMIN"]}>
            <Users />
          </RequireRole>
        ),
      },

      {
        path: "sources",
        element: (
          <RequireRole allow={["SUPER_ADMIN", "PLATFORM_ADMIN"]}>
            <Sources />
          </RequireRole>
        ),
      },

      {
        path: "analyses",
        element: (
          <RequireRole allow={["CLIENT_ADMIN", "CLIENT_ANALYST"]}>
            <Analyses />
          </RequireRole>
        ),
      },
    ],
  },
]);
