import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { findUserByEmail, verifyPassword, signSession, SESSION_COOKIE } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

function rateLimited(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_ATTEMPTS) return true;
  entry.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Enter a valid email and password." }, { status: 400 });
  }

  const key = `${ip}:${parsed.data.email.toLowerCase()}`;
  if (rateLimited(key)) {
    return NextResponse.json({ message: "Too many login attempts. Please try again in 15 minutes." }, { status: 429 });
  }

  const user = await findUserByEmail(parsed.data.email);
  if (!user || !user.isActive) {
    await logAudit({ action: "admin.login.failed", details: { email: parsed.data.email }, ipAddress: ip });
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    await logAudit({ action: "admin.login.failed", userId: user.id, userName: user.name, details: { email: parsed.data.email }, ipAddress: ip });
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }

  const token = signSession({ userId: user.id, email: user.email, name: user.name, role: user.roleName });

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  await logAudit({ action: "admin.login", userId: user.id, userName: user.name, ipAddress: ip });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
