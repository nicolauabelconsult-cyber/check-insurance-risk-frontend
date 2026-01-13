import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { login as apiLogin } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { friendlyError } from "../lib/httpError";
import { apiBaseUrl } from "../lib/env";

import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import Badge from "../components/ui/Badge";

export default function Login() {
  const { setToken, refreshMe } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname ?? "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiLogin(username.trim(), password);
      setToken(data.access_token);
      await refreshMe();
      toast.success("Authenticated");
      nav(from, { replace: true });
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold tracking-wide">Check Insurance Risk</div>
              <Badge tone="neutral">Console</Badge>
            </div>
            <div className="text-xs text-neutral-500">Sign in to access the enterprise risk console.</div>
          </CardHeader>
          <CardBody>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <Label>Username</Label>
                <Input autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button variant="primary" className="w-full" disabled={loading || !username || !password}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
              <div className="pt-3 text-xs text-neutral-600">
                API endpoint: <span className="text-neutral-400">{apiBaseUrl()}</span>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
