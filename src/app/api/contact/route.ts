import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations";
import { sendMail, contactAdminNotificationEmail, contactUserAckEmail } from "@/lib/email";
import { formatDateTime } from "@/lib/utils";

export const runtime = "nodejs";

const CONTACT_RECIPIENT = "cmehcouncilpatna@gmail.com";

/**
 * Simplified contact form: no database. The submitted enquiry is emailed
 * straight to the council, mirroring the registration route's design so this
 * form keeps working even when no database is configured — nothing here
 * depends on Postgres being reachable.
 */

// Simple in-memory rate limiter (per-IP) — resets on server restart. For a
// multi-instance production deployment, replace with a shared store (e.g.
// Redis) keyed the same way.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // requests
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function checkRateLimit(ip: string) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) fieldErrors[String(issue.path[0])] = issue.message;
    }
    return NextResponse.json({ message: "Please correct the errors below.", fieldErrors }, { status: 400 });
  }

  // Honeypot: if filled, silently pretend success (don't tip off bots).
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const { fullName, mobile, email, subject, message } = parsed.data;
  const submittedAt = formatDateTime(new Date());

  const result = await sendMail({
    to: CONTACT_RECIPIENT,
    subject: "Message from website",
    html: contactAdminNotificationEmail({ fullName, mobile, email, subject, message, submittedAt }),
  });

  if (!result.sent) {
    // SMTP isn't configured (or the send failed) — tell the sender plainly
    // rather than pretending it worked, since nothing was saved anywhere else.
    return NextResponse.json(
      { message: "We couldn't send your message right now. Please try again shortly, or contact the council directly." },
      { status: 502 }
    );
  }

  // Best-effort acknowledgement back to the sender — don't fail the request
  // over this one; the council has already received the message either way.
  sendMail({
    to: email,
    subject: "We've received your message – Electrohomeopath Council Patna",
    html: contactUserAckEmail({ fullName }),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
