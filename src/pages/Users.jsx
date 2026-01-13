import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { listUsers, createUser, patchUser, resetUserPassword } from "../api/users";
import { friendlyError } from "../lib/httpError";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import Badge from "../components/ui/Badge";

function Row({ u, onToggleActive, onReset }) {
  return (
    <div className="grid grid-cols-12 gap-3 items-center border-b border-neutral-900 py-3">
      <div className="col-span-3">
        <div className="text-sm font-medium">{u.username}</div>
        <div className="text-xs text-neutral-500">{u.name || "-"}</div>
      </div>
      <div className="col-span-3 text-xs text-neutral-400">{u.email || "-"}</div>
      <div className="col-span-2"><Badge tone={u.role === "ADMIN" ? "yellow" : "neutral"}>{u.role}</Badge></div>
      <div className="col-span-2"><Badge tone={u.is_active ? "green" : "red"}>{u.is_active ? "ACTIVE" : "DISABLED"}</Badge></div>
      <div className="col-span-2 flex gap-2 justify-end">
        <Button variant="secondary" onClick={() => onReset(u)}>Reset PW</Button>
        <Button variant="ghost" onClick={() => onToggleActive(u)}>{u.is_active ? "Disable" : "Enable"}</Button>
      </div>
    </div>
  );
}

export default function Users() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nu, setNu] = useState({ username: "", name: "", email: "", role: "ANALYST", password: "" });

  async function load() {
    setLoading(true);
    try {
      const d = await listUsers();
      setItems(Array.isArray(d) ? d : []);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    try {
      const payload = {
        username: nu.username.trim(),
        name: nu.name || null,
        email: nu.email || null,
        role: nu.role,
        password: nu.password,
      };
      await createUser(payload);
      toast.success("User created");
      setNu({ username: "", name: "", email: "", role: "ANALYST", password: "" });
      await load();
    } catch (err) {
      toast.error(friendlyError(err));
    }
  }

  async function onToggleActive(u) {
    try {
      await patchUser(u.id, { is_active: !u.is_active });
      toast.success("Updated");
      await load();
    } catch (err) {
      toast.error(friendlyError(err));
    }
  }

  async function onReset(u) {
    const pw = prompt(`New password for ${u.username} (min 8 chars):`);
    if (!pw) return;
    try {
      await resetUserPassword(u.id, pw);
      toast.success("Password reset");
    } catch (err) {
      toast.error(friendlyError(err));
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="text-sm font-semibold">Create user</div>
          <div className="text-xs text-neutral-500">Admin defines the password when creating a user.</div>
        </CardHeader>
        <CardBody>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onCreate}>
            <div>
              <Label>Username</Label>
              <Input value={nu.username} onChange={(e) => setNu((s) => ({ ...s, username: e.target.value }))} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={nu.password} onChange={(e) => setNu((s) => ({ ...s, password: e.target.value }))} />
            </div>
            <div>
              <Label>Name</Label>
              <Input value={nu.name} onChange={(e) => setNu((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div>
              <Label>Email (optional)</Label>
              <Input value={nu.email} onChange={(e) => setNu((s) => ({ ...s, email: e.target.value }))} />
            </div>
            <div>
              <Label>Role</Label>
              <select
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm"
                value={nu.role}
                onChange={(e) => setNu((s) => ({ ...s, role: e.target.value }))}
              >
                <option value="ANALYST">ANALYST</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="primary" className="w-full" disabled={!nu.username || !nu.password}>
                Create
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Users</div>
            <div className="text-xs text-neutral-500">Manage access to the console.</div>
          </div>
          <Badge tone="neutral">{loading ? "Loading" : `${items.length}`}</Badge>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-12 gap-3 text-xs text-neutral-600 pb-2 border-b border-neutral-900">
            <div className="col-span-3">User</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {items.map((u) => (
            <Row key={u.id} u={u} onToggleActive={onToggleActive} onReset={onReset} />
          ))}
          {!loading && items.length === 0 ? (
            <div className="py-6 text-sm text-neutral-500">No users found.</div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
