"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Download, Loader2, Eye } from "lucide-react";
import { APPLICATION_STATUS_COLORS, APPLICATION_STATUS_LABELS, formatDate, formatCurrencyINR } from "@/lib/utils";

type Row = {
  id: number;
  applicationNumber: string;
  status: string;
  submittedAt: string;
  registrationCategory: string;
  feeAmount: string;
  candidateName: string;
  mobile: string;
  email: string;
  district: string;
  state: string;
  paymentStatus: string;
};

const STATUS_OPTIONS = ["", "draft", "payment_pending", "payment_completed", "under_review", "info_required", "approved", "rejected"];

function RegistrationsTable() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (status) qs.set("status", status);
    if (district) qs.set("district", district);
    if (state) qs.set("state", state);
    if (search) qs.set("search", search);
    const res = await fetch(`/api/admin/registrations?${qs.toString()}`);
    const json = await res.json();
    setRows(Array.isArray(json) ? json : []);
    setLoading(false);
  }, [status, district, state, search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-ink">Registrations</h1>
        <a
          href="/api/admin/registrations/export"
          className="inline-flex items-center gap-2 text-sm font-semibold bg-brand-primary text-white px-4 py-2 rounded-full hover:bg-brand-primary-dark"
        >
          <Download className="size-4" /> Export CSV
        </a>
      </div>

      <div className="rounded-2xl border border-brand-border bg-white p-4 mb-5 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, number, mobile, email"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-brand-border text-sm focus-ring"
          />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); router.replace(`/admin/registrations`); }} className="py-2 px-3 rounded-lg border border-brand-border text-sm bg-white">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s}>
              {APPLICATION_STATUS_LABELS[s] || s}
            </option>
          ))}
        </select>
        <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="District" className="py-2 px-3 rounded-lg border border-brand-border text-sm" />
        <input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="py-2 px-3 rounded-lg border border-brand-border text-sm" />
      </div>

      <div className="rounded-2xl border border-brand-border bg-white overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-brand-muted">
            <Loader2 className="size-6 animate-spin mx-auto mb-2" /> Loading...
          </div>
        ) : rows.length ? (
          <table className="w-full text-sm">
            <thead className="bg-brand-surface-alt text-left text-xs uppercase tracking-wide text-brand-muted">
              <tr>
                <th className="px-4 py-3">Application #</th>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-brand-surface-alt/60">
                  <td className="px-4 py-3 font-semibold text-brand-primary whitespace-nowrap">{r.applicationNumber}</td>
                  <td className="px-4 py-3">{r.candidateName}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.mobile}</td>
                  <td className="px-4 py-3">{r.registrationCategory}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.submittedAt)}</td>
                  <td className="px-4 py-3 capitalize">{r.paymentStatus}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${APPLICATION_STATUS_COLORS[r.status] || "bg-slate-100"}`}>
                      {APPLICATION_STATUS_LABELS[r.status] || r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatCurrencyINR(r.feeAmount)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/registrations/${r.id}`} className="inline-flex items-center gap-1 text-brand-primary font-semibold">
                      <Eye className="size-4" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-10 text-center text-brand-muted">No applications match these filters.</p>
        )}
      </div>
    </div>
  );
}

export default function AdminRegistrationsPage() {
  return (
    <Suspense fallback={null}>
      <RegistrationsTable />
    </Suspense>
  );
}
