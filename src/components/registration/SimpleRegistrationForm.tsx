"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, ImagePlus, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { getSessionYearOptions } from "@/lib/registration-constants";

const SESSION_YEARS = getSessionYearOptions();

type FormValues = {
  sessionYear: string;
  candidateName: string;
  fathersName: string;
  dob: string;
  nationality: string;
  religion: string;
  birthPlace: string;
  permanentAddress: string;
  presentAddress: string;
  identificationMark: string;
};

const EMPTY: FormValues = {
  sessionYear: SESSION_YEARS[1] || SESSION_YEARS[0] || "",
  candidateName: "",
  fathersName: "",
  dob: "",
  nationality: "Indian",
  religion: "",
  birthPlace: "",
  permanentAddress: "",
  presentAddress: "",
  identificationMark: "",
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-ink mb-1.5">
        {label} {required ? <span className="text-brand-danger">*</span> : null}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-brand-border px-4 py-2.5 focus-ring";

export function SimpleRegistrationForm() {
  const router = useRouter();
  const { push } = useToast();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [sameAddress, setSameAddress] = useState(false);
  const [signature, setSignature] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function onSignatureChange(file: File | null) {
    setSignature(file);
    setSignaturePreview(file ? URL.createObjectURL(file) : null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        fd.append(key, sameAddress && key === "presentAddress" ? values.permanentAddress : value);
      });
      if (signature) fd.append("signature", signature);

      const res = await fetch("/api/registration/submit", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        push("error", json.message || "Could not submit your registration. Please try again.");
        return;
      }
      router.push("/registration/success");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-brand-border bg-white p-6 sm:p-8">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Select Session Year" required>
          <select value={values.sessionYear} onChange={(e) => set("sessionYear", e.target.value)} className={`${inputClass} bg-white`} required>
            {SESSION_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Candidate's Name" required>
          <input value={values.candidateName} onChange={(e) => set("candidateName", e.target.value)} className={inputClass} required />
        </Field>
        <Field label="Father's Name" required>
          <input value={values.fathersName} onChange={(e) => set("fathersName", e.target.value)} className={inputClass} required />
        </Field>
        <Field label="Date of Birth" required>
          <input type="date" value={values.dob} onChange={(e) => set("dob", e.target.value)} className={inputClass} required />
        </Field>
        <Field label="Nationality" required>
          <input value={values.nationality} onChange={(e) => set("nationality", e.target.value)} className={inputClass} required />
        </Field>
        <Field label="Religion" required>
          <input value={values.religion} onChange={(e) => set("religion", e.target.value)} className={inputClass} required />
        </Field>
        <Field label="Birth Place" required>
          <input value={values.birthPlace} onChange={(e) => set("birthPlace", e.target.value)} className={inputClass} required />
        </Field>
        <Field label="Identification Mark" required>
          <input
            value={values.identificationMark}
            onChange={(e) => set("identificationMark", e.target.value)}
            placeholder="e.g. Mole on left cheek"
            className={inputClass}
            required
          />
        </Field>
      </div>

      <Field label="Permanent Address" required>
        <textarea rows={3} value={values.permanentAddress} onChange={(e) => set("permanentAddress", e.target.value)} className={inputClass} required />
      </Field>

      <div>
        <label className="flex items-center gap-2 text-sm text-brand-body mb-2">
          <input
            type="checkbox"
            checked={sameAddress}
            onChange={(e) => setSameAddress(e.target.checked)}
            className="size-4"
          />
          Present address is the same as permanent address
        </label>
        {!sameAddress ? (
          <Field label="Present Address" required>
            <textarea rows={3} value={values.presentAddress} onChange={(e) => set("presentAddress", e.target.value)} className={inputClass} required />
          </Field>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-ink mb-1.5">
          Upload Signature <span className="text-brand-danger">*</span>
        </label>
        {signaturePreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={signaturePreview} alt="Signature preview" className="h-20 rounded-lg border border-brand-border object-contain bg-white mb-3 px-3" />
        ) : null}
        <label className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary cursor-pointer">
          <ImagePlus className="size-4" />
          {signature ? "Replace signature image" : "Choose signature image"}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            required
            onChange={(e) => onSignatureChange(e.target.files?.[0] || null)}
          />
        </label>
        <p className="text-xs text-brand-muted mt-1">JPG, PNG or WEBP. A clear photo of your signature on plain paper works fine.</p>
      </div>

      <div className="rounded-xl bg-brand-surface-alt border border-brand-border p-4 text-sm text-brand-body flex gap-2.5">
        <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-brand-primary" />
        <span>
          On submitting, these details (and your signature image) will be emailed directly to the council for review. There is no
          fee to submit this form.
        </span>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-brand-primary px-8 py-3 rounded-full hover:bg-brand-primary-dark disabled:opacity-60"
      >
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Submit Registration
      </button>
    </form>
  );
}
