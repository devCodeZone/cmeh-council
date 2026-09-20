import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-insecure-secret";
const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || "cmeh_admin_session";

function isValidSession(token: string | undefined) {
  if (!token) return false;
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

/**
 * Protects every /admin page (except /admin/login) and every /api/admin
 * route (except the login endpoint). Individual pages/routes still perform
 * their own role checks (see src/lib/auth.ts hasRole) — this proxy only
 * guarantees "is this a signed-in admin session at all".
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authenticated = isValidSession(token);

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!authenticated) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/api/admin") && pathname !== "/api/admin/auth/login") {
    if (!authenticated) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
