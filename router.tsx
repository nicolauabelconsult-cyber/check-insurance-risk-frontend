import { createBrowserRouter } from "react-router-dom";
import { RequireAuth } from "../auth/RequireAuth";
import { RequireAdmin } from "../auth/RequireAdmin";
import { Shell } from "../components/Shell";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Sources from "../pages/Sources";
import UsersList from "../pages/users/UsersList";
import UserNew from "../pages/users/UserNew";
import UserEdit from "../pages/users/UserEdit";
import NotFound from "../pages/NotFound";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <RequireAuth><Shell /></RequireAuth>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "sources", element: <Sources /> },
      { path: "users", element: <RequireAdmin><UsersList /></RequireAdmin> },
      { path: "users/new", element: <RequireAdmin><UserNew /></RequireAdmin> },
      { path: "users/:id", element: <RequireAdmin><UserEdit /></RequireAdmin> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
