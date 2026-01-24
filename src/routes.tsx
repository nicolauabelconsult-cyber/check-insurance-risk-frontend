import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import MainLayout from "./MainLayout";
import { RequireAuth, RequirePerm } from "./RequireAuth";

import RiskList from "../features/risk/RiskList";
import RiskDetail from "../features/risk/RiskDetail";
import RiskCreate from "../features/risk/RiskCreate";
import SourceList from "../features/sources/SourceList";
import SourceUpload from "../features/sources/SourceUpload";
import UserList from "../features/users/UserList";
import UserCreate from "../features/users/UserCreate";
import UserEdit from "../features/users/UserEdit";
import AuditList from "../features/audit/AuditList";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
        <Route path="/risks" element={<RiskList />} />
        <Route path="/risks/new" element={<RiskCreate />} />
        <Route path="/risks/:id" element={<RiskDetail />} />

        <Route path="/sources" element={
          <RequirePerm perm="sources:read">
            <>
              <SourceUpload />
              <SourceList />
            </>
          </RequirePerm>
        } />

        <Route path="/users" element={<RequirePerm perm="users:read"><UserList /></RequirePerm>} />
        <Route path="/users/new" element={<RequirePerm perm="users:create"><UserCreate /></RequirePerm>} />
        <Route path="/users/:id" element={<RequirePerm perm="users:update"><UserEdit /></RequirePerm>} />

        <Route path="/audit" element={<RequirePerm perm="audit:read"><AuditList /></RequirePerm>} />
      </Route>
    </Routes>
  );
}
