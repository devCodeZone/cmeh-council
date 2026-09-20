"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";

type EventRow = {
  id: number;
  title: string;
  startDate: string;
  endDate: string | null;
  venue: string | null;
  status: string;
};

export default function AdminEventsPage() {
  const { push } = useToast();
  const [rows, setRows] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/events");
    setRows(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(row: EventRow) {
    if (!confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/events/${row.id}`, { method: "DELETE" });
    push("success", "Event deleted.");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-ink">Events</h1>
        <Link href="/admin/events/new" className="inline-flex items-center gap-2 text-sm font-semibold bg-brand-primary text-white px-4 py-2 rounded-full hover:bg-brand-primary-dark">
          <Plus className="size-4" /> Add Event
        </Link>
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
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-brand-surface-alt/60">
                  <td className="px-4 py-3 font-medium text-brand-ink">{row.title}</td>
                  <td className="px-4 py-3">{row.venue || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(row.startDate)}
                    {row.endDate ? ` – ${formatDate(row.endDate)}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${row.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                      {row.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/events/${row.id}/edit`} title="Edit" className="text-brand-muted hover:text-brand-primary">
                        <Pencil className="size-4" />
                      </Link>
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
          <p className="p-10 text-center text-brand-muted">No events yet. Click &ldquo;Add Event&rdquo; to create one.</p>
        )}
      </div>
    </div>
  );
}
