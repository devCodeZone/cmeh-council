import { NextResponse } from "next/server";
import { getSession, hasRole, type SessionPayload } from "@/lib/auth";

export async function requireAdminSession(
  minRole: string = "content_editor"
): Promise<{ session: SessionPayload } | { error: NextResponse }> {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ message: "Authentication required." }, { status: 401 }) };
  }
  if (!hasRole(session, minRole)) {
    return { error: NextResponse.json({ message: "You do not have permission to perform this action." }, { status: 403 }) };
  }
  return { session };
}
