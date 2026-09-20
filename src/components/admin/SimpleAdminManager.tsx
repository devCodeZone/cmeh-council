"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, X, Save, ImagePlus } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export type FieldConfig = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "checkbox" | "select" | "image";
  options?: string[];
  required?: boolean;
  imageBucket?: string;
};

export type ColumnConfig = {
  key: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (row: any) => React.ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

export function SimpleAdminManager({
  title,
  apiBase,
  fields,
  columns,
  defaultValues = {},
}: {
  title: string;
  apiBase: string;
  fields: FieldConfig[];
  columns: ColumnConfig[];
  defaultValues?: Row;
}) {
  const { push } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [values, setValues] = useState<Row>(defaultValues);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch(apiBase);
    setRows(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setValues(defaultValues);
    setFormOpen(true);
  }

  function openEdit(row: Row) {
    setEditing(row);
    setValues(row);
    setFormOpen(true);
  }

  async function uploadImage(key: string, bucket: string, file: File) {
    setUploading(key);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", bucket);
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        push("error", json.message || "Image upload failed.");
        return;
      }
      setValues((v) => ({ ...v, [key]: json.path }));
    } finally {
      setUploading(null);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editing ? "PATCH" : "POST";
      const body = editing ? { ...values, id: editing.id } : values;
      const res = await fetch(apiBase, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        push("error", json.message || "Could not save.");
        return;
      }
      push("success", editing ? "Updated successfully." : "Created successfully.");
      setFormOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: Row) {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    await fetch(`${apiBase}?id=${row.id}`, { method: "DELETE" });
    push("success", "Deleted.");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-ink">{title}</h1>
        <button onClick={openCreate} className="inline-flex items-center gap-2 text-sm font-semibold bg-brand-primary text-white px-4 py-2 rounded-full hover:bg-brand-primary-dark">
          <Plus className="size-4" /> Add New
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
                {columns.map((c) => (
                  <th key={c.key} className="px-4 py-3">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-brand-surface-alt/60">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 align-top">
                      {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openEdit(row)} title="Edit" className="text-brand-muted hover:text-brand-primary">
                        <Pencil className="size-4" />
                      </button>
                      <button onClick={() => remove(row)} title="Delete" className="text-brand-muted hover:text-brand-danger">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-10 text-center text-brand-muted">Nothing here yet. Click &ldquo;Add New&rdquo; to create one.</p>
        )}
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-brand-ink">{editing ? "Edit" : "Add New"}</h2>
              <button onClick={() => setFormOpen(false)} className="text-brand-muted hover:text-brand-ink">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-brand-ink mb-1.5">
                    {f.label} {f.required ? <span className="text-brand-danger">*</span> : null}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea
                      required={f.required}
                      rows={3}
                      value={values[f.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                      className="w-full rounded-xl border border-brand-border px-4 py-2.5"
                    />
                  ) : f.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      checked={!!values[f.key]}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.checked }))}
                      className="size-4"
                    />
                  ) : f.type === "select" ? (
                    <select
                      value={values[f.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                      className="w-full rounded-xl border border-brand-border px-4 py-2.5 bg-white"
                    >
                      <option value="">Select...</option>
                      {f.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "image" ? (
                    <div>
                      {values[f.key] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={values[f.key]} alt="" className="size-20 rounded-lg object-cover mb-2" />
                      ) : null}
                      <label className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary cursor-pointer">
                        {uploading === f.key ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                        {values[f.key] ? "Replace image" : "Upload image"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadImage(f.key, f.imageBucket || "images", file);
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <input
                      type={f.type}
                      required={f.required}
                      value={values[f.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value }))}
                      className="w-full rounded-xl border border-brand-border px-4 py-2.5"
                    />
                  )}
                </div>
              ))}
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
