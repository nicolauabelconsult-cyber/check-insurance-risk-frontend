import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { login as apiLogin } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { friendlyError } from "../lib/httpError";

import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Badge } from "../components/ui/Badge";
import { apiBaseUrl } from "../lib/env";

const schema = z.object({
  username: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const { setToken, refreshMe } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as any;
  const from = loc.state?.from?.pathname ?? "/";

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const m = useMutation({
    mutationFn: async (data: FormData) => apiLogin(data.username.trim(), data.password),
    onSuccess: async (data) => {
      setToken(data.access_token);
      await refreshMe();
      toast.success("Authenticated");
      nav(from, { replace: true });
    },
    onError: (e: any) => toast.error(friendlyError(e)),
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold tracking-wide">Check Insurance Risk</div>
              <Badge>Console</Badge>
            </div>
            <div className="text-xs text-neutral-500">Sign in to access the enterprise risk console.</div>
          </CardHeader>
          <CardBody>
            <form className="space-y-4" onSubmit={form.handleSubmit((data) => m.mutate(data))}>
              <div>
                <Label>Username</Label>
                <Input autoComplete="username" {...form.register("username")} />
                {form.formState.errors.username && <div className="mt-1 text-xs text-red-200">{form.formState.errors.username.message}</div>}
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" autoComplete="current-password" {...form.register("password")} />
                {form.formState.errors.password && <div className="mt-1 text-xs text-red-200">{form.formState.errors.password.message}</div>}
              </div>
              <Button variant="primary" className="w-full" disabled={m.isPending}>
                {m.isPending ? "Signing in..." : "Sign in"}
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
