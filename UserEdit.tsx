import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { getUser, updateUser } from "../../api/users";
import { friendlyError } from "../../lib/httpError";
import { userUpdateSchema, type UserUpdateForm } from "./schemas";

import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";

export default function UserEdit() {
  const { id } = useParams();
  const userId = Number(id);
  const qc = useQueryClient();
  const nav = useNavigate();

  const q = useQuery({ queryKey: ["users", userId], queryFn: () => getUser(userId), enabled: Number.isFinite(userId) });

  const form = useForm<UserUpdateForm>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: { name: "", email: "", username: "", role: "ANALYST", is_active: true },
  });

  useEffect(() => {
    if (!q.data) return;
    form.reset({
      name: q.data.name ?? "",
      email: q.data.email ?? "",
      username: q.data.username ?? "",
      role: q.data.role ?? "ANALYST",
      is_active: q.data.is_active !== false,
    });
  }, [q.data]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const saveM = useMutation({
    mutationFn: async (data: UserUpdateForm) => updateUser(userId, {
      name: data.name?.trim() || null,
      email: data.email?.trim() || null,
      username: data.username.trim(),
      role: data.role,
      is_active: data.is_active,
    }),
    onSuccess: async () => {
      toast.success("Changes saved");
      await qc.invalidateQueries({ queryKey: ["users"] });
      await qc.invalidateQueries({ queryKey: ["users", userId] });
    },
    onError: (e: any) => toast.error(friendlyError(e)),
  });

  const deactivateM = useMutation({
    mutationFn: async () => updateUser(userId, { is_active: false }),
    onSuccess: async () => {
      toast.success("User deactivated");
      setConfirmOpen(false);
      await qc.invalidateQueries({ queryKey: ["users"] });
      await qc.invalidateQueries({ queryKey: ["users", userId] });
      form.setValue("is_active", false);
    },
    onError: (e: any) => toast.error(friendlyError(e)),
  });

  const headerName = useMemo(() => q.data?.name || q.data?.username || "User", [q.data]);

  if (!Number.isFinite(userId)) return <div className="text-neutral-300">Invalid user id.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Edit user</h1>
          <div className="mt-1 text-xs text-neutral-500">{headerName}</div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/users"><Button variant="ghost">Back</Button></Link>
          <Button variant="ghost" onClick={() => nav("/users/new")}>New</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm font-semibold">Profile & access</div>
            <div className="text-xs text-neutral-500">Patch user properties, role, and status.</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={form.watch("is_active") ? "good" : "bad"}>{form.watch("is_active") ? "ACTIVE" : "DISABLED"}</Badge>
            <Badge tone="neutral">PATCH /api/users/{userId}</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={form.handleSubmit((d) => saveM.mutate(d))}>
            <div>
              <Label>Name</Label>
              <Input {...form.register("name")} />
              {form.formState.errors.name && <div className="mt-1 text-xs text-red-200">{form.formState.errors.name.message}</div>}
            </div>
            <div>
              <Label>Email</Label>
              <Input {...form.register("email")} />
              {form.formState.errors.email && <div className="mt-1 text-xs text-red-200">{form.formState.errors.email.message}</div>}
            </div>
            <div>
              <Label>Username</Label>
              <Input {...form.register("username")} />
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

            <div className="md:col-span-2 flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 accent-neutral-200" checked={form.watch("is_active")} onChange={(e)=>form.setValue("is_active", e.target.checked)} />
                <span className="text-sm text-neutral-300">Active</span>
              </div>

              <div className="flex items-center gap-2">
                {form.watch("is_active") && (
                  <Button type="button" variant="danger" onClick={()=>setConfirmOpen(true)} disabled={deactivateM.isPending}>Deactivate</Button>
                )}
                <Button type="submit" variant="primary" disabled={saveM.isPending}>{saveM.isPending ? "Saving..." : "Save"}</Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>

      <Modal open={confirmOpen} title="Deactivate user" description="This will immediately prevent console access." onClose={()=>setConfirmOpen(false)} primaryLabel="Deactivate" danger loading={deactivateM.isPending} onPrimary={()=>deactivateM.mutate()}>
        <div className="text-sm text-neutral-300">You can reactivate the user later from the directory.</div>
      </Modal>
    </div>
  );
}
