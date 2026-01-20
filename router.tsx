import { createBrowserRouter } from "react-router-dom";
import RequireAuth from "../auth/RequireAuth";
import RequireRole from "../auth/RequireRole";
import AppShell from "../components/AppShell";

import Login from "../pages/Login";
import Overview from "../pages/Overview";
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
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Overview /> },
      {
        path: "entities",
        element: (
          <RequireRole roles={["SUPER_ADMIN"]}>
            <Entities />
          </RequireRole>
        ),
      },
      {
        path: "users",
        element: (
          <RequireRole roles={["SUPER_ADMIN", "PLATFORM_ADMIN"]}>
            <Users />
          </RequireRole>
        ),
      },
      {
        path: "sources",
        element: (
          <RequireRole roles={["SUPER_ADMIN", "PLATFORM_ADMIN"]}>
            <Sources />
          </RequireRole>
        ),
      },
      {
        path: "analyses",
        element: (
          <RequireRole roles={["SUPER_ADMIN", "PLATFORM_ADMIN", "CLIENT_ADMIN", "CLIENT_ANALYST"]}>
            <Analyses />
          </RequireRole>
        ),
      },
    ],
  },
]);
