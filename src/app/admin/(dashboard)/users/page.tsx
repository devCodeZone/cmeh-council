"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, UserX, Loader2, X, Save } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { formatDateTime } from "@/lib/utils";

type Role = { id: number; name: string; description: string | null };
type AdminUser = {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export default function AdminUsersPage() {
  const { push } = useToast();
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [values, setValues] = useState<{ name: string; email: string; password: string; roleId: string; isActive: boolean }>({
    name: "",
    email: "",
    password: "",
    roleId: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [u, r] = await Promise.all([fetch("/api/admin/users").then((res) => res.json()), fetch("/api/admin/roles").then((res) => res.json())]);
    setRows(u);
    setRoles(r);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setValues({ name: "", email: "", password: "", roleId: String(roles[0]?.id || ""), isActive: true });
    setFormOpen(true);
  }

  function openEdit(row: AdminUser) {
    setEditing(row);
    setValues({ name: row.name, email: row.email, password: "", roleId: String(row.roleId), isActive: row.isActive });
    setFormOpen(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const body: Record<string, unknown> = { id: editing.id, name: values.name, roleId: Number(values.roleId), isActive: values.isActive };
        if (values.password) body.password = values.password;
        const res = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          push("error", json.message || "Could not update user.");
          return;
        }
        push("success", "User updated.");
      } else {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, roleId: Number(values.roleId) }),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          push("error", json.message || "Could not create user.");
          return;
        }
        push("success", "Admin user created.");
      }
      setFormOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(row: AdminUser) {
    if (!confirm(`Deactivate "${row.name}"? They will no longer be able to log in.`)) return;
    const res = await fetch(`/api/admin/users?id=${row.id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      push("error", json.message || "Could not deactivate user.");
      return;
    }
    push("success", "User deactivated.");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-ink">Admin Users</h1>
        <button onClick={openCreate} className="inline-flex items-center gap-2 text-sm font-semibold bg-brand-primary text-white px-4 py-2 rounded-full hover:bg-brand-primary-dark">
          <Plus className="size-4" /> Add Admin User
        </button>
      </div>

      <div className="rounded-2xl border border-brand-border bg-white overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-brand-muted">
            <Loader2 className="size-6 animate-spin mx-auto" />
          </div>
        ) : rows.length ? (
          <table className="w-full text-sm">
            <thead className="bg-brand-surface-alt text-left text-xs uppercase tracking-wide text-brand-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Login</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-brand-surface-alt/60">
                  <td className="px-4 py-3 font-medium text-brand-ink">{row.name}</td>
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3 capitalize">{row.roleName.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${row.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                      {row.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.lastLoginAt ? formatDateTime(row.lastLoginAt) : "Never"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openEdit(row)} title="Edit" className="text-brand-muted hover:text-brand-primary">
                        <Pencil className="size-4" />
                      </button>
                      {row.isActive ? (
                        <button onClick={() => deactivate(row)} title="Deactivate" className="text-brand-muted hover:text-brand-danger">
                          <UserX className="size-4" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-10 text-center text-brand-muted">No admin users found.</p>
        )}
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-brand-ink">{editing ? "Edit Admin User" : "Add Admin User"}</h2>
              <button onClick={() => setFormOpen(false)} className="text-brand-muted hover:text-brand-ink">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-ink mb-1.5">Full Name *</label>
                <input required value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} className="w-full rounded-xl border border-brand-border px-4 py-2.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-ink mb-1.5">Email *</label>
                <input
                  type="email"
                  required
                  disabled={!!editing}
                  value={values.email}
                  onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                  className="w-full rounded-xl border border-brand-border px-4 py-2.5 disabled:bg-brand-surface-alt disabled:text-brand-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-ink mb-1.5">{editing ? "New Password (leave blank to keep unchanged)" : "Password *"}</label>
                <input
                  type="password"
                  required={!editing}
                  minLength={8}
                  value={values.password}
                  onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
                  className="w-full rounded-xl border border-brand-border px-4 py-2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-ink mb-1.5">Role *</label>
                <select
                  required
                  value={values.roleId}
                  onChange={(e) => setValues((v) => ({ ...v, roleId: e.target.value }))}
                  className="w-full rounded-xl border border-brand-border px-4 py-2.5 bg-white"
                >
                  <option value="">Select a role...</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-brand-ink">
                <input type="checkbox" checked={values.isActive} onChange={(e) => setValues((v) => ({ ...v, isActive: e.target.checked }))} className="size-4" />
                Active
              </label>
              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-brand-primary py-3 rounded-full hover:bg-brand-primary-dark disabled:opacity-60"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
