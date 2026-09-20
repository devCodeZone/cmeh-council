"use client";

/**
 * Client-side GA4 event helper. Safe to call even when analytics isn't
 * configured or blocked (ad blockers, consent not given) — it's a no-op.
 */
export type AnalyticsEvent =
  | "registration_started"
  | "registration_submitted"
  | "payment_initiated"
  | "payment_successful"
  | "document_download"
  | "whatsapp_click"
  | "phone_click"
  | "contact_form_submission";

export function trackEvent(name: AnalyticsEvent, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  try {
    w.gtag?.("event", name, params);
  } catch {
    // analytics should never break the UI
  }
}
