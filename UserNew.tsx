import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createUser } from "../../api/users";
import { friendlyError } from "../../lib/httpError";
import { userCreateSchema, type UserCreateForm } from "./schemas";

import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";

export default function UserNew() {
  const qc = useQueryClient();
  const nav = useNavigate();

  const form = useForm<UserCreateForm>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: { name: "", email: "", username: "", role: "ANALYST", password: "", confirm: "" },
  });

  const m = useMutation({
    mutationFn: async (data: UserCreateForm) => createUser({
      username: data.username.trim(),
      name: data.name?.trim() || null,
      email: data.email?.trim() || null,
      role: data.role,
      password: data.password,
    }),
    onSuccess: async () => {
      toast.success("User created");
      await qc.invalidateQueries({ queryKey: ["users"] });
      nav("/users");
    },
    onError: (e: any) => toast.error(friendlyError(e)),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Create user</h1>
          <div className="mt-1 text-xs text-neutral-500">Admin-defined password at creation.</div>
        </div>
        <Link to="/users"><Button variant="ghost">Back</Button></Link>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">User profile</div>
            <div className="mt-1 text-xs text-neutral-500">Minimal directory information for controlled access.</div>
          </div>
          <Badge tone="neutral">POST /api/users</Badge>
        </CardHeader>
        <CardBody>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={form.handleSubmit((d) => m.mutate(d))}>
            <div>
              <Label>Name (optional)</Label>
              <Input {...form.register("name")} placeholder="e.g., Maria Pereira" />
              {form.formState.errors.name && <div className="mt-1 text-xs text-red-200">{form.formState.errors.name.message}</div>}
            </div>
            <div>
              <Label>Email (optional)</Label>
              <Input {...form.register("email")} placeholder="name@company.com" />
              {form.formState.errors.email && <div className="mt-1 text-xs text-red-200">{form.formState.errors.email.message}</div>}
            </div>
            <div>
              <Label>Username</Label>
              <Input {...form.register("username")} placeholder="maria.pereira" />
              {form.formState.errors.username && <div className="mt-1 text-xs text-red-200">{form.formState.errors.username.message}</div>}
            </div>
            <div>
              <Label>Role</Label>
              <Select {...form.register("role")}>
                <option value="ANALYST">ANALYST</option>
                <option value="ADMIN">ADMIN</option>
              </Select>
              {form.formState.errors.role && <div className="mt-1 text-xs text-red-200">{form.formState.errors.role.message}</div>}
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" {...form.register("password")} />
              {form.formState.errors.password && <div className="mt-1 text-xs text-red-200">{form.formState.errors.password.message}</div>}
            </div>
            <div>
              <Label>Confirm</Label>
              <Input type="password" {...form.register("confirm")} />
              {form.formState.errors.confirm && <div className="mt-1 text-xs text-red-200">{form.formState.errors.confirm.message}</div>}
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" type="button" onClick={() => form.reset()}>Reset</Button>
              <Button variant="primary" type="submit" disabled={m.isPending}>
                {m.isPending ? "Creating..." : "Create user"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
