"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Save } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { APPLICATION_STATUS_LABELS } from "@/lib/utils";

const STATUS_OPTIONS = ["draft", "payment_pending", "payment_completed", "under_review", "info_required", "approved", "rejected"];

export function RegistrationStatusPanel({
  applicationId,
  currentStatus,
  currentNote,
}: {
  applicationId: number;
  currentStatus: string;
  currentNote: string | null;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState(currentNote || "");
  const [notify, setNotify] = useState(true);
  const [saving, setSaving] = useState(false);

  async function save(overrideStatus?: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/registrations/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: overrideStatus || status, internalNote: note, notifyCandidate: notify }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        push("error", json.message || "Could not update application.");
        return;
      }
      push("success", "Application updated.");
      if (overrideStatus) setStatus(overrideStatus);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-brand-border bg-white p-6">
      <h2 className="font-semibold text-brand-ink mb-4">Application Status</h2>

      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => save("approved")}
          disabled={saving}
          className="inline-flex items-center gap-1.5 text-sm font-semibold bg-brand-success text-white px-4 py-2 rounded-full hover:brightness-95 disabled:opacity-60"
        >
          <CheckCircle2 className="size-4" /> Approve
        </button>
        <button
          onClick={() => save("rejected")}
          disabled={saving}
          className="inline-flex items-center gap-1.5 text-sm font-semibold bg-brand-danger text-white px-4 py-2 rounded-full hover:brightness-95 disabled:opacity-60"
        >
          <XCircle className="size-4" /> Reject
        </button>
        <button
          onClick={() => save("info_required")}
          disabled={saving}
          className="inline-flex items-center gap-1.5 text-sm font-semibold bg-amber-500 text-white px-4 py-2 rounded-full hover:brightness-95 disabled:opacity-60"
        >
          Request More Information
        </button>
      </div>

      <label className="block text-sm font-medium text-brand-ink mb-1.5">Status</label>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl border border-brand-border px-4 py-2.5 mb-4 bg-white">
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {APPLICATION_STATUS_LABELS[s] || s}
          </option>
        ))}
      </select>

      <label htmlFor="internalNote" className="block text-sm font-medium text-brand-ink mb-1.5">
        Internal Note {status === "info_required" ? "(shown to candidate on Track Application)" : ""}
      </label>
      <textarea
        id="internalNote"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        className="w-full rounded-xl border border-brand-border px-4 py-2.5 mb-4"
      />

      <label className="flex items-center gap-2 mb-4 text-sm text-brand-ink">
        <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Notify candidate by email
      </label>

      <button
        onClick={() => save()}
        disabled={saving}
        className="inline-flex items-center gap-2 text-sm font-semibold bg-brand-primary text-white px-5 py-2.5 rounded-full hover:bg-brand-primary-dark disabled:opacity-60"
      >
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Save Changes
      </button>
    </div>
  );
}
