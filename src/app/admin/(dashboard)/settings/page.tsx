"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Settings = any;

function Field({ label, value, onChange, textarea = false, hint }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-ink mb-1.5">{label}</label>
      {textarea ? (
        <textarea rows={3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-brand-border px-4 py-2.5" />
      ) : (
        <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-brand-border px-4 py-2.5" />
      )}
      {hint ? <p className="text-xs text-brand-muted mt-1">{hint}</p> : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-brand-border bg-white p-6 space-y-4">
      <h2 className="font-semibold text-brand-ink text-lg">{title}</h2>
      {children}
    </div>
  );
}

export default function AdminSettingsPage() {
  const { push } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  function set(path: string[], value: unknown) {
    setSettings((prev: Settings) => {
      const next = structuredClone(prev);
      let cur = next;
      for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
      cur[path[path.length - 1]] = value;
      return next;
    });
  }

  async function onSave() {
    setSaving(true);
    try {
      const { url: _url, theme: _theme, ...rest } = settings;
      void _url;
      void _theme;
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rest),
      });
      if (!res.ok) {
        push("error", "Could not save settings.");
        return;
      }
      push("success", "Settings saved.");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <div className="p-10 text-center text-brand-muted">
        <Loader2 className="size-6 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-ink">Website Settings</h1>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-brand-primary px-5 py-2.5 rounded-full hover:bg-brand-primary-dark disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save All Changes
        </button>
      </div>

      <Section title="Organisation Identity">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Organisation Name" value={settings.orgName} onChange={(v) => set(["orgName"], v)} />
          <Field label="Short Name" value={settings.shortName} onChange={(v) => set(["shortName"], v)} />
        </div>
        <Field label="Tagline" value={settings.tagline} onChange={(v) => set(["tagline"], v)} />
      </Section>

      <Section title="Address & Contact (NAP)">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Address Line 1" value={settings.address?.line1} onChange={(v) => set(["address", "line1"], v)} />
          <Field label="Address Line 2" value={settings.address?.line2} onChange={(v) => set(["address", "line2"], v)} />
          <Field label="City" value={settings.address?.city} onChange={(v) => set(["address", "city"], v)} />
          <Field label="State" value={settings.address?.state} onChange={(v) => set(["address", "state"], v)} />
          <Field label="Pincode" value={settings.address?.pincode} onChange={(v) => set(["address", "pincode"], v)} />
          <Field label="Country" value={settings.address?.country} onChange={(v) => set(["address", "country"], v)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Primary Phone" value={settings.phone} onChange={(v) => set(["phone"], v)} />
          <Field label="Alternate Phone" value={settings.altPhone} onChange={(v) => set(["altPhone"], v)} />
          <Field label="WhatsApp Number (digits only, with country code)" value={settings.whatsappNumber} onChange={(v) => set(["whatsappNumber"], v)} />
          <Field label="Contact Email" value={settings.email} onChange={(v) => set(["email"], v)} />
        </div>
        <Field label="Office Hours" value={settings.officeHours} onChange={(v) => set(["officeHours"], v)} />
        <Field label="Google Maps Embed URL" value={settings.googleMapsEmbedUrl} onChange={(v) => set(["googleMapsEmbedUrl"], v)} />
        <Field label="Google Maps Directions URL" value={settings.googleMapsDirectionsUrl} onChange={(v) => set(["googleMapsDirectionsUrl"], v)} />
      </Section>

      <Section title="Social Media">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Facebook URL" value={settings.social?.facebook} onChange={(v) => set(["social", "facebook"], v)} />
          <Field label="Instagram URL" value={settings.social?.instagram} onChange={(v) => set(["social", "instagram"], v)} />
          <Field label="YouTube URL" value={settings.social?.youtube} onChange={(v) => set(["social", "youtube"], v)} />
          <Field label="LinkedIn URL" value={settings.social?.linkedin} onChange={(v) => set(["social", "linkedin"], v)} />
        </div>
      </Section>

      <Section title="Registration Fee">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1.5">Amount (INR)</label>
            <input
              type="number"
              value={settings.registrationFee?.amountInr ?? 0}
              onChange={(e) => set(["registrationFee", "amountInr"], Number(e.target.value))}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5"
            />
            <p className="text-xs text-brand-muted mt-1">
              While this is 0, the payment gateway is skipped and applications move straight to review.
            </p>
          </div>
          <Field label="Fee Note (shown to applicants)" value={settings.registrationFee?.note} onChange={(v) => set(["registrationFee", "note"], v)} />
        </div>
      </Section>

      <Section title="Analytics & Verification">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Google Analytics (GA4) Measurement ID" value={settings.gaMeasurementId} onChange={(v) => set(["gaMeasurementId"], v)} />
          <Field label="Google Search Console Verification Code" value={settings.googleSiteVerification} onChange={(v) => set(["googleSiteVerification"], v)} />
        </div>
      </Section>

      <Section title="Legal & Recognition">
        <Field
          label="Recognition / Affiliation Statement"
          value={settings.recognitionStatement}
          onChange={(v) => set(["recognitionStatement"], v)}
          textarea
          hint="Only state recognition, approval or affiliation facts that are verified and documented — never invent or imply status here."
        />
        <div className="sm:w-1/2">
          <label className="block text-sm font-medium text-brand-ink mb-1.5">Founding Year</label>
          <input
            type="number"
            value={settings.foundingYear ?? ""}
            onChange={(e) => set(["foundingYear"], e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-xl border border-brand-border px-4 py-2.5"
          />
        </div>
        <Field label="Applicant Declaration Text" value={settings.declarationText} onChange={(v) => set(["declarationText"], v)} textarea />
        <label className="flex items-center gap-2 text-sm font-medium text-brand-ink">
          <input type="checkbox" checked={!!settings.requireAadhaar} onChange={(e) => set(["requireAadhaar"], e.target.checked)} className="size-4" />
          Require Aadhaar number on the registration form
        </label>
      </Section>
    </div>
  );
}
