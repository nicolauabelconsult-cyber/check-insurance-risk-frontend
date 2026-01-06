import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

import { listUsers, updateUser } from "../../api/users";
import { friendlyError } from "../../lib/httpError";

import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { DataTable } from "../../components/DataTable";

import type { UserRead } from "../../types";

function roleTone(role: string) {
  if (role === "ADMIN") return "warn";
  if (role === "ANALYST") return "neutral";
  return "neutral";
}

export default function UsersList() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["users"], queryFn: listUsers });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [target, setTarget] = useState<UserRead | null>(null);

  const deactivateM = useMutation({
    mutationFn: async () => {
      if (!target) throw new Error("No target selected.");
      return updateUser(target.id, { is_active: false });
    },
    onSuccess: async () => {
      toast.success("User deactivated");
      setConfirmOpen(false);
      setTarget(null);
      await qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: any) => toast.error(friendlyError(e)),
  });

  const activateM = useMutation({
    mutationFn: async (u: UserRead) => updateUser(u.id, { is_active: true }),
    onSuccess: async () => {
      toast.success("User activated");
      await qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: any) => toast.error(friendlyError(e)),
  });

  const data = useMemo(() => (q.data ?? []).sort((a,b)=> (b.id ?? 0) - (a.id ?? 0)), [q.data]);

  const columns = useMemo<ColumnDef<UserRead>[]>(() => [
    { header: "ID", accessorKey: "id", cell: (c) => <span className="text-neutral-300">{c.getValue<number>()}</span> },
    {
      header: "User",
      accessorKey: "username",
      cell: (c) => {
        const u = c.row.original;
        return (
          <div>
            <div className="font-medium text-neutral-100">{u.name || u.username}</div>
            <div className="text-xs text-neutral-500">{u.email || u.username}</div>
          </div>
        );
      },
    },
    { header: "Role", accessorKey: "role", cell: (c) => <Badge tone={roleTone(String(c.getValue())) as any}>{String(c.getValue())}</Badge> },
    {
      header: "Status",
      id: "status",
      cell: (c) => {
        const active = c.row.original.is_active !== false;
        return <Badge tone={active ? "good" : "bad"}>{active ? "ACTIVE" : "DISABLED"}</Badge>;
      },
    },
    {
      header: "",
      id: "actions",
      cell: (c) => {
        const u = c.row.original;
        const active = u.is_active !== false;
        return (
          <div className="flex items-center justify-end gap-2">
            <Link to={`/users/${u.id}`}><Button size="sm" variant="ghost">Edit</Button></Link>
            {active ? (
              <Button size="sm" variant="ghost" onClick={() => { setTarget(u); setConfirmOpen(true); }}>
                Deactivate
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => activateM.mutate(u)} disabled={activateM.isPending}>
                Activate
              </Button>
            )}
          </div>
        );
      },
    },
  ], [activateM]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Users</h1>
          <div className="mt-1 text-xs text-neutral-500">Administration and access control.</div>
        </div>
        <Link to="/users/new"><Button variant="primary">Create user</Button></Link>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Directory</div>
            <div className="mt-1 text-xs text-neutral-500">Search, edit, activate/deactivate.</div>
          </div>
          <Badge tone={q.isError ? "bad" : "neutral"}>{q.isLoading ? "Loading" : `${data.length} users`}</Badge>
        </CardHeader>
        <CardBody>
          <DataTable
            data={data}
            columns={columns}
            getSearchText={(u) => `${u.id} ${u.username} ${u.name ?? ""} ${u.email ?? ""} ${u.role}`}
            searchPlaceholder="Search users..."
          />
        </CardBody>
      </Card>

      <Modal
        open={confirmOpen}
        title="Deactivate user"
        description={target ? `Deactivating ${target.name || target.username} will prevent access to the console.` : ""}
        onClose={() => { setConfirmOpen(false); setTarget(null); }}
        primaryLabel="Deactivate"
        danger
        loading={deactivateM.isPending}
        onPrimary={() => deactivateM.mutate()}
      >
        <div className="text-sm text-neutral-300">This action is reversible by reactivating the account later.</div>
      </Modal>
    </div>
  );
}
