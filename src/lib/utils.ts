import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(date: string | Date | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrencyINR(amount: number | string | null | undefined) {
  const n = Number(amount || 0);
  return n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}

/** Generates a unique application reference number, e.g. CMEH-2026-000123. */
export function buildApplicationNumber(sequence: number, year = new Date().getFullYear()) {
  return `CMEH-${year}-${String(sequence).padStart(6, "0")}`;
}

export function slugify(input: string) {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function humanFileSize(bytes: number | null | undefined) {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let val = bytes;
  let i = 0;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(val < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export function truncate(text: string, length = 160) {
  if (!text) return "";
  return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  draft: "Application Received",
  payment_pending: "Payment Pending",
  payment_completed: "Payment Completed",
  under_review: "Under Review",
  info_required: "Additional Information Required",
  approved: "Approved",
  rejected: "Rejected",
};

export const APPLICATION_STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  payment_pending: "bg-amber-100 text-amber-800",
  payment_completed: "bg-emerald-100 text-emerald-800",
  under_review: "bg-blue-100 text-blue-800",
  info_required: "bg-orange-100 text-orange-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};
