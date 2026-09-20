import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, roles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-insecure-secret";
export const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || "cmeh_admin_session";

export type SessionPayload = {
  userId: number;
  email: string;
  name: string;
  role: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

/** Read + verify the current admin session from cookies (Server Components / Route Handlers). */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }
  return session;
}

/** Role hierarchy: super_admin > admin > (registration_officer | content_editor | accountant) */
const ROLE_RANK: Record<string, number> = {
  super_admin: 100,
  admin: 80,
  registration_officer: 50,
  content_editor: 50,
  accountant: 50,
};

export function hasRole(session: SessionPayload | null, minRole: string) {
  if (!session) return false;
  const userRank = ROLE_RANK[session.role] ?? 0;
  const requiredRank = ROLE_RANK[minRole] ?? 0;
  return userRank >= requiredRank;
}

export async function findUserByEmail(email: string) {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      passwordHash: users.passwordHash,
      isActive: users.isActive,
      roleName: roles.name,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);
  return rows[0] ?? null;
}
