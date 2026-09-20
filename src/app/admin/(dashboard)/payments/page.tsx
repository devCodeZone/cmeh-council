import { db } from "@/lib/db";
import { payments, applications, candidates } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { formatCurrencyINR, formatDateTime } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  successful: "bg-emerald-100 text-emerald-800",
  created: "bg-slate-100 text-slate-700",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-blue-100 text-blue-800",
};

export default async function AdminPaymentsPage() {
  const rows = await db
    .select({
      id: payments.id,
      applicationNumber: applications.applicationNumber,
      candidateName: candidates.fullName,
      amount: payments.amount,
      provider: payments.provider,
      orderId: payments.orderId,
      paymentId: payments.paymentId,
      status: payments.status,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .innerJoin(applications, eq(payments.applicationId, applications.id))
    .innerJoin(candidates, eq(applications.candidateId, candidates.id))
    .orderBy(desc(payments.createdAt));

  const totalCollected = rows.filter((r) => r.status === "successful").reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-brand-ink">Payments</h1>
        <div className="rounded-xl bg-emerald-50 text-emerald-800 px-5 py-2.5 text-sm font-semibold">
          Total Collected: {formatCurrencyINR(totalCollected)}
        </div>
      </div>

      <div className="rounded-2xl border border-brand-border bg-white overflow-x-auto">
        {rows.length ? (
          <table className="w-full text-sm">
            <thead className="bg-brand-surface-alt text-left text-xs uppercase tracking-wide text-brand-muted">
              <tr>
                <th className="px-4 py-3">Application #</th>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Gateway</th>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Payment ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-brand-surface-alt/60">
                  <td className="px-4 py-3 font-semibold text-brand-primary whitespace-nowrap">{r.applicationNumber}</td>
                  <td className="px-4 py-3">{r.candidateName}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatCurrencyINR(r.amount)}</td>
                  <td className="px-4 py-3 capitalize">{r.provider}</td>
                  <td className="px-4 py-3 text-xs">{r.orderId || "—"}</td>
                  <td className="px-4 py-3 text-xs">{r.paymentId || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[r.status] || "bg-slate-100"}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-10 text-center text-brand-muted">No payment records yet.</p>
        )}
      </div>
    </div>
  );
}
