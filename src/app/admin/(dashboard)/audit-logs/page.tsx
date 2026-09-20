"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

type LogRow = {
  id: number;
  userName: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: any;
  createdAt: string;
};

export default function AdminAuditLogsPage() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit-logs")
      .then((r) => r.json())
      .then((data) => {
        setRows(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-ink mb-2">Audit Logs</h1>
      <p className="text-sm text-brand-muted mb-6">Showing the most recent 200 administrative actions.</p>

      <div className="rounded-2xl border border-brand-border bg-white overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-brand-muted">
            <Loader2 className="size-6 animate-spin mx-auto" />
          </div>
        ) : rows.length ? (
          <table className="w-full text-sm">
            <thead className="bg-brand-surface-alt text-left text-xs uppercase tracking-wide text-brand-muted">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-brand-surface-alt/60 align-top">
                  <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(row.createdAt)}</td>
                  <td className="px-4 py-3">{row.userName || "System"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.action}</td>
                  <td className="px-4 py-3">
                    {row.entityType ? (
                      <span className="text-xs text-brand-muted">
                        {row.entityType}
                        {row.entityId ? ` #${row.entityId}` : ""}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.details ? <code className="text-xs text-brand-muted break-all">{JSON.stringify(row.details)}</code> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-10 text-center text-brand-muted">No audit log entries yet.</p>
        )}
      </div>
    </div>
  );
}
