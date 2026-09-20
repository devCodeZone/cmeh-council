"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Loader2, Download, CreditCard } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { openRazorpayCheckout } from "@/lib/razorpay-client";
import { APPLICATION_STATUS_COLORS } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

type TrackResult = {
  applicationNumber: string;
  candidateName: string;
  status: string;
  statusLabel: string;
  submittedAt: string;
  registrationCategory?: string;
  internalNote?: string | null;
  payment: { status: string; amount: string; provider: string } | null;
  canRetryPayment: boolean;
};

export function TrackApplicationClient() {
  const params = useSearchParams();
  const { push } = useToast();
  const [applicationNumber, setApplicationNumber] = useState(params.get("app") || "");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationNumber, contact }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Application not found.");
        return;
      }
      setResult(json);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function retryPayment() {
    if (!result) return;
    setPaying(true);
    try {
      const res = await fetch(`/api/registration/${result.applicationNumber}/retry-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact }),
      });
      const json = await res.json();
      if (!res.ok) {
        push("error", json.message || "Could not start payment. Please contact the council office.");
        return;
      }
      trackEvent("payment_initiated");
      await openRazorpayCheckout({
        keyId: json.keyId,
        orderId: json.orderId,
        amount: json.amount,
        applicationId: json.applicationId,
        applicationNumber: json.applicationNumber,
        name: json.candidateName,
        email: json.email,
        contact: json.mobile,
        onSuccess: () => {
          trackEvent("payment_successful");
          push("success", "Payment successful! Your application has moved to review.");
          onSubmit({ preventDefault: () => {} } as React.FormEvent);
        },
        onFailure: () => push("error", "Payment was not completed. You can try again."),
      });
    } finally {
      setPaying(false);
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 grid sm:grid-cols-[1fr_1fr_auto] gap-4 items-end">
        <div>
          <label htmlFor="applicationNumber" className="block text-sm font-medium text-brand-ink mb-1.5">
            Application Number
          </label>
          <input
            id="applicationNumber"
            value={applicationNumber}
            onChange={(e) => setApplicationNumber(e.target.value)}
            placeholder="CMEH-2026-000001"
            required
            className="w-full rounded-xl border border-brand-border px-4 py-2.5 focus-ring"
          />
        </div>
        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-brand-ink mb-1.5">
            Registered Mobile Number or Email
          </label>
          <input
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            className="w-full rounded-xl border border-brand-border px-4 py-2.5 focus-ring"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary text-white font-semibold px-6 py-2.5 hover:bg-brand-primary-dark focus-ring disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          Track
        </button>
      </form>

      {error ? <p className="mt-4 text-brand-danger text-sm text-center">{error}</p> : null}

      {result ? (
        <div className="mt-8 rounded-2xl border border-brand-border bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-brand-muted">Application Number</p>
              <p className="font-bold text-brand-primary text-lg">{result.applicationNumber}</p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${APPLICATION_STATUS_COLORS[result.status] || "bg-slate-100 text-slate-700"}`}>
              {result.statusLabel}
            </span>
          </div>
          <dl className="grid sm:grid-cols-2 gap-4 mb-6">
            <div>
              <dt className="text-xs uppercase tracking-wide text-brand-muted">Applicant</dt>
              <dd className="text-brand-ink">{result.candidateName}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-brand-muted">Submitted</dt>
              <dd className="text-brand-ink">{new Date(result.submittedAt).toLocaleDateString("en-IN")}</dd>
            </div>
            {result.registrationCategory ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-brand-muted">Category</dt>
                <dd className="text-brand-ink">{result.registrationCategory}</dd>
              </div>
            ) : null}
            {result.payment ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-brand-muted">Payment</dt>
                <dd className="text-brand-ink capitalize">{result.payment.status}</dd>
              </div>
            ) : null}
          </dl>

          {result.internalNote ? (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 mb-6">
              <strong>Note from council:</strong> {result.internalNote}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {result.canRetryPayment ? (
              <button
                onClick={retryPayment}
                disabled={paying}
                className="inline-flex items-center gap-2 rounded-full bg-brand-accent text-white font-semibold px-6 py-2.5 hover:brightness-95 focus-ring disabled:opacity-60"
              >
                {paying ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
                Pay Registration Fee
              </button>
            ) : null}
            <LinkButton href={`/api/registration/${result.applicationNumber}/acknowledgement?contact=${encodeURIComponent(contact)}`} variant="secondary" size="sm">
              <Download className="size-4" /> Download Acknowledgement
            </LinkButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
