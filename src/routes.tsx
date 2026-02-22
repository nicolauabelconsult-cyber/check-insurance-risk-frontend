import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import { RequireAuth, RequirePerm } from "./RequireAuth";
import MainLayout from "./MainLayout";

import RiskList from "./RiskList";
import RiskCreate from "./RiskCreate";
import RiskDetail from "./RiskDetail";
import Sources from "./Sources";
import Users from "./Users";
import UserCreate from "./UserCreate";
import UserEdit from "./UserEdit";
import Audit from "./Audit";
import ExecutiveDashboard from "./ExecutiveDashboard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
        {/* Mantemos /dashboard por compatibilidade, mas o único dashboard é o Executivo */}
        <Route path="/dashboard" element={<Navigate to="/dashboard-executivo" replace />} />
        <Route path="/dashboard-executivo" element={<ExecutiveDashboard />} />
        <Route path="/" element={<RiskList />} />
        <Route path="/risks" element={<RiskList />} />
        <Route path="/risks/new" element={<RequirePerm perm="risk:create"><RiskCreate /></RequirePerm>} />
        <Route path="/risks/:id" element={<RequirePerm perm="risk:read"><RiskDetail /></RequirePerm>} />

        <Route path="/sources" element={<RequirePerm perm="sources:read"><Sources /></RequirePerm>} />

        <Route path="/users" element={<RequirePerm perm="users:read"><Users /></RequirePerm>} />
        <Route path="/users/new" element={<RequirePerm perm="users:create"><UserCreate /></RequirePerm>} />
        <Route path="/users/:id" element={<RequirePerm perm="users:update"><UserEdit /></RequirePerm>} />

        <Route path="/audit" element={<RequirePerm perm="audit:read"><Audit /></RequirePerm>} />
      </Route>
    </Routes>
  );
}
