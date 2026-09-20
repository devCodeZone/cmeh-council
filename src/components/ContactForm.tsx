"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { trackEvent } from "@/lib/analytics";

export function ContactForm() {
  const { push } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.fieldErrors) setErrors(json.fieldErrors);
        push("error", json.message || "Something went wrong. Please try again.");
        return;
      }
      trackEvent("contact_form_submission");
      setDone(true);
      push("success", "Message sent successfully. We'll get back to you shortly.");
      form.reset();
    } catch {
      push("error", "Network error — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <h3 className="font-semibold text-emerald-800 text-lg mb-2">Message sent successfully</h3>
        <p className="text-emerald-700 text-sm">Thank you for reaching out. Our team will respond to your enquiry shortly.</p>
        <button onClick={() => setDone(false)} className="mt-4 text-sm font-semibold text-emerald-800 underline">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {/* Honeypot field — hidden from real users, bots often fill every field */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Field label="Full Name" name="fullName" required error={errors.fullName} />
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Mobile Number" name="mobile" type="tel" required error={errors.mobile} />
        <Field label="Email" name="email" type="email" required error={errors.email} />
      </div>
      <Field label="Subject" name="subject" error={errors.subject} />
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-brand-ink mb-1.5">
          Message <span className="text-brand-danger">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          className="w-full rounded-xl border border-brand-border px-4 py-3 focus-ring"
        />
        {errors.message ? (
          <p id="message-error" className="text-sm text-brand-danger mt-1">
            {errors.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary text-white font-semibold px-7 py-3.5 hover:bg-brand-primary-dark transition-colors focus-ring disabled:opacity-60 w-full sm:w-auto"
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {submitting ? "Sending message..." : "Send Message"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-brand-ink mb-1.5">
        {label} {required ? <span className="text-brand-danger">*</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className="w-full rounded-xl border border-brand-border px-4 py-3 focus-ring"
      />
      {error ? (
        <p id={`${name}-error`} className="text-sm text-brand-danger mt-1">
          {error}
        </p>
      ) : null}
    </div>
  );
}
