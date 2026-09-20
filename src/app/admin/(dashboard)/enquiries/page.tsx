"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2, Mail, MailOpen, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { formatDateTime } from "@/lib/utils";

type Enquiry = {
  id: number;
  fullName: string;
  mobile: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-brand-accent-light text-brand-accent",
  read: "bg-slate-100 text-slate-600",
  responded: "bg-emerald-100 text-emerald-800",
};

export default function AdminEnquiriesPage() {
  const { push } = useToast();
  const [rows, setRows] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/enquiries");
    setRows(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(row: Enquiry, status: string) {
    await fetch("/api/admin/enquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, status }),
    });
    load();
  }

  async function remove(row: Enquiry) {
    if (!confirm(`Delete enquiry from "${row.fullName}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/enquiries?id=${row.id}`, { method: "DELETE" });
    push("success", "Enquiry deleted.");
    load();
  }

  function toggleExpand(row: Enquiry) {
    setExpanded((cur) => (cur === row.id ? null : row.id));
    if (row.status === "new") setStatus(row, "read");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-ink mb-6">Contact Enquiries</h1>

      <div className="rounded-2xl border border-brand-border bg-white overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-brand-muted">
            <Loader2 className="size-6 animate-spin mx-auto" />
          </div>
        ) : rows.length ? (
          <div className="divide-y divide-brand-border">
            {rows.map((row) => (
              <div key={row.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button onClick={() => toggleExpand(row)} className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-brand-ink">{row.fullName}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[row.status] || STATUS_STYLES.new}`}>{row.status}</span>
                    </div>
                    <p className="text-sm text-brand-muted">{row.subject || "No subject"}</p>
                    <p className="text-xs text-brand-muted mt-1">
                      {row.email} · {row.mobile} · {formatDateTime(row.createdAt)}
                    </p>
                  </button>
                  <div className="flex items-center gap-3 shrink-0">
                    {row.status !== "responded" ? (
                      <button onClick={() => setStatus(row, "responded")} title="Mark as responded" className="text-brand-muted hover:text-emerald-600">
                        <CheckCircle2 className="size-4" />
                      </button>
                    ) : null}
                    {row.status === "new" ? (
                      <MailOpen className="size-4 text-brand-muted" />
                    ) : (
                      <Mail className="size-4 text-brand-muted opacity-40" />
                    )}
                    <button onClick={() => remove(row)} title="Delete" className="text-brand-muted hover:text-brand-danger">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                {expanded === row.id ? (
                  <p className="mt-3 text-sm text-brand-ink bg-brand-surface-alt rounded-xl p-4 whitespace-pre-wrap">{row.message}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="p-10 text-center text-brand-muted">No enquiries received yet.</p>
        )}
      </div>
    </div>
  );
}
